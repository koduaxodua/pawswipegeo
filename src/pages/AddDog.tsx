import { useState, useRef } from 'react';
import exifr from 'exifr';
import { useDogs } from '@/hooks/useDogs';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Plus, PawPrint, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationPicker } from '@/components/LocationPicker';
import { useT, useLocale } from '@/contexts/Locale';
import { AdaptivePetPhoto } from '@/components/AdaptivePetPhoto';

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const result = canvas.toDataURL('image/jpeg', quality);
      resolve(result);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
};

/**
 * Extract GPS coordinates from a photo's EXIF.
 *
 * Tries three strategies in order:
 *  1) exifr.gps() helper — fastest, works for typical JPEGs
 *  2) exifr.parse() with full metadata — catches edge cases where helper returns null
 *     but the raw GPSLatitude/GPSLongitude fields are present
 *  3) Manual DMS → decimal conversion from the raw degree/minute/second arrays
 *
 * Returns null if no usable GPS could be extracted (HEIC stripped on mobile,
 * social-media photos, screenshots, photos taken with Location off, etc.).
 */
async function extractPhotoGps(file: File): Promise<{ lat: number; lng: number } | null> {
  // Strategy 1: official helper
  try {
    const gps = await exifr.gps(file);
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      return { lat: gps.latitude, lng: gps.longitude };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[exif] gps() failed');
    }
  }

  // Strategy 2 + 3: full parse, then either pre-converted lat/lng or raw DMS fallback
  try {
    const data: any = await exifr.parse(file, { gps: true });
    if (data && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
      return { lat: data.latitude, lng: data.longitude };
    }
    if (data?.GPSLatitude && data?.GPSLongitude) {
      const toDecimal = (dms: any, ref?: string): number => {
        if (typeof dms === 'number') return ref === 'S' || ref === 'W' ? -dms : dms;
        if (!Array.isArray(dms) || dms.length < 3) return NaN;
        const dec = Number(dms[0]) + Number(dms[1]) / 60 + Number(dms[2]) / 3600;
        return ref === 'S' || ref === 'W' ? -dec : dec;
      };
      const lat = toDecimal(data.GPSLatitude, data.GPSLatitudeRef);
      const lng = toDecimal(data.GPSLongitude, data.GPSLongitudeRef);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[exif] parse failed');
    }
  }

  return null;
}

/** Reverse-geocode (mirrors LocationPicker logic) — used only when EXIF GPS is found. */
async function reverseLabel(lat: number, lng: number, lang: string): Promise<string> {
  for (const zoom of [18, 17, 16]) {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('zoom', String(zoom));
      url.searchParams.set('accept-language', lang);
      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const data = await res.json();
      const a = data?.address ?? {};
      const street = a.road || a.pedestrian || a.residential || a.street || a.path;
      const num = a.house_number;
      const line = street && num ? `${street} ${num}` : street || a.neighbourhood || a.quarter || a.suburb || '';
      const area = a.city || a.town || a.village;
      const parts = [line, area].filter(Boolean);
      if (a.road && a.house_number) return parts.join(', '); // best — return immediately
      if (parts.length) return parts.join(', '); // partial — keep as fallback, try next zoom
    } catch {
      // try next
    }
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function toCoarseLocationLabel(label: string, locale: string): string {
  const parts = label.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (/\d/.test(first)) return last;
    return first.toLowerCase() === last.toLowerCase() ? first : `${first}, ${last}`;
  }
  return label.replace(/\s+\d+[\w/-]*/g, '').trim()
    || (locale === 'en' ? 'Approximate location selected' : 'მიახლოებითი მდებარეობა არჩეულია');
}

export default function AddDog() {
  const t = useT();
  const { locale } = useLocale();
  const { addDog } = useDogs();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [photoExifLocation, setPhotoExifLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    name: '',
    age: '',
    breed: '',
    gender: 'მამრობითი' as 'მამრობითი' | 'მდედრობითი',
    personality: '',
    health: '',
    location: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    photo: '',
    caretakerPhone: '',
    caretakerName: '',
    description: '',
    contactConsent: false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: t('addDog.toast.notImage'), variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t('addDog.toast.tooBig'), variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      // Run compression and EXIF parsing in parallel — both work off the same file.
      const [compressed, gps] = await Promise.all([compressImage(file), extractPhotoGps(file)]);

      const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);

      if (gps) {
        // Auto-fill the location from photo EXIF — overrides whatever the user
        // had set previously. Reverse-geocode in the background for a label.
        const { lat, lng } = gps;
        const label = toCoarseLocationLabel(
          await reverseLabel(lat, lng, locale === 'en' ? 'en,ka' : 'ka,en'),
          locale
        );
        setForm(prev => ({ ...prev, photo: compressed, lat, lng, location: label }));
        setPhotoExifLocation({ lat, lng });
        toast({
          title:
            locale === 'en'
              ? `📷 Location detected from photo`
              : `📷 ლოკაცია ფოტოდან ამოცნობილია`,
          description:
            locale === 'en'
              ? `${label} · ${sizeKB}KB`
              : `${label} · ${sizeKB}KB`,
        });
      } else {
        update('photo', compressed);
        toast({
          title: t('addDog.toast.uploaded', { size: sizeKB }),
          description:
            locale === 'en'
              ? "Photo doesn't have GPS data — set the location on the map below."
              : 'ფოტოს არ აქვს GPS მონაცემები — მონიშნე ლოკაცია რუკაზე.',
        });
      }
    } catch {
      toast({ title: t('addDog.toast.failed'), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.photo || !form.location) {
      toast({ title: t('addDog.toast.requiredFields'), variant: 'destructive' });
      return;
    }
    if (!form.contactConsent) {
      setShowConsentError(true);
      toast({
        title:
          locale === 'en'
            ? 'Please confirm you have permission to publish the contact information.'
            : 'გთხოვთ დაადასტუროთ, რომ საკონტაქტო ინფორმაციის გამოქვეყნების უფლება გაქვთ.',
        variant: 'destructive',
      });
      return;
    }
    setShowConsentError(false);
    setSubmitting(true);
    try {
      const { contactConsent, ...petPayload } = form;
      await addDog({
        ...petPayload,
        contactConsentAcknowledgedAt: new Date().toISOString(),
      });
      toast({ title: t('addDog.toast.success', { name: form.name }) });
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      toast({ title: t('addDog.toast.addFailed', { error: msg }), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 pr-topbar">
        <Plus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('addDog.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo upload */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-medium text-primary-foreground mb-2">{t('addDog.photo')}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {form.photo ? (
            <div className="relative">
              <AdaptivePetPhoto src={form.photo} alt="preview" mode="preview" />
              <button
                type="button"
                onClick={() => { update('photo', ''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute top-2 right-2 glass h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm font-medium">{t('addDog.uploading')}</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">{t('addDog.upload')}</span>
                  <span className="text-xs">{t('addDog.upload.hint')}</span>
                </>
              )}
            </button>
          )}
        </div>


        {/* Location picker — current GPS or autocomplete search */}
        <LocationPicker
          lat={form.lat}
          lng={form.lng}
          locationLabel={form.location}
          photoExif={photoExifLocation}
          onChange={({ lat, lng, label }) =>
            setForm(prev => ({ ...prev, lat, lng, location: label }))
          }
        />

        {/* Two-column grid on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t('addDog.field.name')} value={form.name} onChange={v => update('name', v)} placeholder={t('addDog.field.namePh')} />
          <FormField label={t('addDog.field.age')} value={form.age} onChange={v => update('age', v)} placeholder={t('addDog.field.agePh')} />
          <FormField label={t('addDog.field.breed')} value={form.breed} onChange={v => update('breed', v)} placeholder={t('addDog.field.breedPh')} />
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-medium text-primary-foreground mb-2">{t('addDog.field.gender')}</label>
          <div className="flex gap-3">
            {(['მამრობითი', 'მდედრობითი'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('gender', g)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  form.gender === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {g === 'მამრობითი' ? t('addDog.gender.male') : t('addDog.gender.female')}
              </button>
            ))}
          </div>
        </div>

        <FormField label={t('addDog.field.personality')} value={form.personality} onChange={v => update('personality', v)} placeholder={t('addDog.field.personalityPh')} multiline />
        <FormField label={t('addDog.field.health')} value={form.health} onChange={v => update('health', v)} placeholder={t('addDog.field.healthPh')} />
        <FormField label={t('addDog.field.description')} value={form.description} onChange={v => update('description', v)} placeholder={t('addDog.field.descriptionPh')} multiline />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t('addDog.field.caretakerName')} value={form.caretakerName} onChange={v => update('caretakerName', v)} placeholder={t('addDog.field.caretakerNamePh')} />
          <div className="glass rounded-2xl p-4">
            <label className="block text-sm font-medium text-primary-foreground mb-2">
              {locale === 'en' ? 'Contact phone' : 'საკონტაქტო ნომერი'}
            </label>
            <input
              value={form.caretakerPhone}
              onChange={e => update('caretakerPhone', e.target.value)}
              placeholder={t('addDog.field.phonePh')}
              className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-muted-foreground outline-none"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {locale === 'en'
                ? 'The number will be shown publicly on the pet profile.'
                : 'ნომერი საჯაროდ გამოჩნდება ცხოველის პროფილზე.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-pressed={form.contactConsent}
          onClick={() => {
            const next = !form.contactConsent;
            update('contactConsent', next);
            if (next) setShowConsentError(false);
          }}
          className={`glass w-full rounded-2xl p-4 text-left transition active:scale-[0.99] ${
            form.contactConsent
              ? 'ring-2 ring-primary/60'
              : showConsentError
                ? 'ring-2 ring-destructive/70'
                : 'hover:ring-1 hover:ring-primary/35'
          }`}
        >
          <span className="flex items-center gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${
                form.contactConsent
                  ? 'border-primary bg-primary text-primary-foreground'
                  : showConsentError
                    ? 'border-destructive/80 bg-destructive/10 text-destructive'
                    : 'border-border bg-secondary/80 text-muted-foreground'
              }`}
            >
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug text-primary-foreground">
                {locale === 'en'
                  ? 'I agree and confirm that the contact information is mine or I have permission to publish it.'
                  : 'ვეთანხმები და ვადასტურებ, რომ საკონტაქტო ინფორმაცია ჩემია ან მაქვს მისი გამოქვეყნების უფლება.'}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {locale === 'en'
                  ? 'Required before publishing a public pet profile.'
                  : 'აუცილებელია ცხოველის საჯარო პროფილის გამოსაქვეყნებლად.'}
              </span>
            </span>
          </span>
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PawPrint className="h-5 w-5" />}
          {submitting ? t('addDog.submitting') : t('addDog.submit')}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <label className="block text-sm font-medium text-primary-foreground mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[80px]"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-muted-foreground outline-none"
        />
      )}
    </div>
  );
}
