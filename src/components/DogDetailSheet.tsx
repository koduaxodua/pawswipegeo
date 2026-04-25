import { Dog } from '@/data/dogs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Phone, Heart, Calendar, Shield, Trash2, Check } from 'lucide-react';
import { useDeleteRequests } from '@/hooks/useDeleteRequests';
import { toast } from '@/hooks/use-toast';
import { useT, useLocale } from '@/contexts/Locale';

interface Props {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DogDetailSheet({ dog, open, onOpenChange }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const { isRequested, requestDelete, cancelRequest } = useDeleteRequests();
  const requested = isRequested(dog.id);

  // Translate gender enum at display time (data is stored in Georgian)
  const genderLabel =
    locale === 'en' && dog.gender
      ? dog.gender === 'მამრობითი'
        ? t('addDog.gender.value.male')
        : t('addDog.gender.value.female')
      : dog.gender;

  const handleDeleteRequest = () => {
    if (requested) {
      cancelRequest(dog.id);
      toast({ title: t('detail.deleteRequest.cancelToast') });
    } else {
      requestDelete(dog.id);
      toast({ title: t('detail.deleteRequest.toast') });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl glass-strong overflow-y-auto !left-1/2 !-translate-x-1/2 !max-w-lg !w-full px-5 pb-8">
        <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mt-2 mb-4" />
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-foreground">{dog.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-3 space-y-3">
          <img
            src={dog.photo}
            alt={dog.name}
            className="w-full h-56 sm:h-72 object-cover rounded-2xl"
          />

          <div className="grid grid-cols-2 gap-2">
            <InfoChip icon={<Calendar className="h-3.5 w-3.5" />} label={t('detail.label.age')} value={dog.age} />
            <InfoChip icon={<Heart className="h-3.5 w-3.5" />} label={t('detail.label.gender')} value={genderLabel} />
            <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} label={t('detail.label.location')} value={dog.location} />
            <InfoChip icon={<Shield className="h-3.5 w-3.5" />} label={t('detail.label.breed')} value={dog.breed} />
          </div>

          {dog.description && (
            <div className="glass rounded-xl p-3 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.description')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{dog.description}</p>
            </div>
          )}

          {dog.personality && (
            <div className="glass rounded-xl p-3 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.personality')}</h3>
              <p className="text-xs text-muted-foreground">{dog.personality}</p>
            </div>
          )}

          {dog.health && (
            <div className="glass rounded-xl p-3 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.health')}</h3>
              <p className="text-xs text-muted-foreground">{dog.health}</p>
            </div>
          )}

          <div className="glass rounded-xl p-3">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{t('detail.section.caretaker')}</h3>
            {dog.caretakerName && <p className="text-xs text-muted-foreground">{dog.caretakerName}</p>}
            <a
              href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {dog.caretakerPhone}
            </a>
          </div>

          <button
            onClick={handleDeleteRequest}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition active:scale-[0.98] ${
              requested
                ? 'bg-secondary text-foreground border border-border'
                : 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20'
            }`}
          >
            {requested ? <Check className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            {requested ? t('detail.deleteRequest.cancel') : t('detail.deleteRequest')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-2.5 flex items-start gap-2">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
