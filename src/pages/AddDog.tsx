import { useState, useRef } from 'react';
import { useDogs } from '@/hooks/useDogs';
import { toast } from '@/hooks/use-toast';
import { Plus, PawPrint, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LocationPicker } from '@/components/LocationPicker';

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

export default function AddDog() {
  const { addDog } = useDogs();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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
  });

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'გთხოვთ აირჩიოთ სურათი', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'სურათი ძალიან დიდია (მაქს. 10MB)', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      update('photo', compressed);
      const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);
      toast({ title: `ფოტო ატვირთულია (${sizeKB}KB) ✓` });
    } catch {
      toast({ title: 'ფოტოს დამუშავება ვერ მოხერხდა', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.photo || !form.caretakerPhone || !form.location) {
      toast({ title: 'გთხოვთ შეავსოთ სავალდებულო ველები და აირჩიე ლოკაცია რუკაზე', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await addDog(form);
      toast({ title: `${form.name} წარმატებით დაემატა! 🐾` });
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'უცნობი შეცდომა';
      toast({ title: `დამატება ვერ მოხერხდა: ${msg}`, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">ცხოველის დამატება</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo upload */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-medium text-primary-foreground mb-2">ფოტო *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {form.photo ? (
            <div className="relative">
              <img src={form.photo} alt="preview" className="w-full h-48 sm:h-64 object-cover rounded-2xl" />
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
                  <span className="text-sm font-medium">მუშავდება...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">ფოტოს ატვირთვა</span>
                  <span className="text-xs">მაქს. 10MB, ავტო-კომპრესია</span>
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
          onChange={({ lat, lng, label }) =>
            setForm(prev => ({ ...prev, lat, lng, location: label }))
          }
        />

        {/* Two-column grid on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="სახელი *" value={form.name} onChange={v => update('name', v)} placeholder="მაგ: ბობი" />
          <FormField label="ასაკი" value={form.age} onChange={v => update('age', v)} placeholder="მაგ: 2 წელი" />
          <FormField label="ჯიში" value={form.breed} onChange={v => update('breed', v)} placeholder="მაგ: ნარევი" />
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-medium text-primary-foreground mb-2">სქესი</label>
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
                {g === 'მამრობითი' ? '♂ მამრობითი' : '♀ მდედრობითი'}
              </button>
            ))}
          </div>
        </div>

        <FormField label="ხასიათი" value={form.personality} onChange={v => update('personality', v)} placeholder="მაგ: მეგობრული, მშვიდი" multiline />
        <FormField label="ჯანმრთელობა" value={form.health} onChange={v => update('health', v)} placeholder="მაგ: აცრილი, ჯანმრთელი" />
        <FormField label="აღწერა" value={form.description} onChange={v => update('description', v)} placeholder="მოკლე აღწერა ძაღლის შესახებ..." multiline />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="თქვენი სახელი" value={form.caretakerName} onChange={v => update('caretakerName', v)} placeholder="მაგ: ნინო" />
          <FormField label="საკონტაქტო ნომერი *" value={form.caretakerPhone} onChange={v => update('caretakerPhone', v)} placeholder="+995 5XX XX XX XX" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PawPrint className="h-5 w-5" />}
          {submitting ? 'იტვირთება...' : 'ცხოველის დამატება'}
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
