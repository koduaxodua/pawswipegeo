import { Dog } from '@/data/dogs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Phone, Heart, Calendar, Shield, Trash2, Check, AlertCircle, Map as MapIcon } from 'lucide-react';
import { canRequestPetDeletion, useDeleteRequests } from '@/hooks/useDeleteRequests';
import { toast } from '@/hooks/use-toast';
import { useT, useLocale } from '@/contexts/Locale';
import { useTranslatedDog } from '@/hooks/useTranslatedDog';
import { AdaptivePetPhoto } from '@/components/AdaptivePetPhoto';

interface Props {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowOnMap?: (dog: Dog) => void;
}

export function DogDetailSheet({ dog: rawDog, open, onOpenChange, onShowOnMap }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const dog = useTranslatedDog(rawDog) ?? rawDog;
  const { isRequested, requestDelete } = useDeleteRequests();
  const requested = isRequested(dog.id);
  const canSendDeletionRequest = canRequestPetDeletion(dog.id);

  // Translate gender enum at display time (data is stored in Georgian)
  const genderLabel =
    locale === 'en' && dog.gender
      ? dog.gender === 'მამრობითი'
        ? t('addDog.gender.value.male')
        : t('addDog.gender.value.female')
      : dog.gender;

  const handleDeleteRequest = async () => {
    if (requested) return;

    if (!canSendDeletionRequest) {
      toast({
        title: locale === 'en' ? 'Demo profile' : 'საცდელი პროფილი',
        description:
          locale === 'en'
            ? 'Demo profiles cannot be sent for admin review.'
            : 'საცდელი პროფილის მოთხოვნა admin-ში არ იგზავნება.',
      });
      return;
    }

    try {
      await requestDelete(dog.id);
      toast({
        title:
          locale === 'en'
            ? 'Request sent and will be reviewed.'
            : 'მოთხოვნა გაიგზავნა და შემოწმდება.',
      });
    } catch {
      toast({
        title: t('common.error'),
        description:
          locale === 'en'
            ? 'Could not send the deletion request.'
            : 'წაშლის მოთხოვნის გაგზავნა ვერ მოხერხდა.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl glass-strong !left-1/2 !-translate-x-1/2 !max-w-lg !w-full p-0 flex flex-col">
        {/* drag handle */}
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/50 mt-2 mb-2 flex-shrink-0" />
        <SheetHeader className="px-5 flex-shrink-0">
          <SheetTitle className="text-xl font-bold text-foreground">{dog.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {locale === 'en' ? 'Pet profile details and deletion request action.' : 'ცხოველის პროფილის დეტალები და წაშლის მოთხოვნის მოქმედება.'}
          </SheetDescription>
        </SheetHeader>

        {/* scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-3 pb-3 space-y-3">
          <AdaptivePetPhoto src={dog.photo} alt={dog.name} mode="detail" />

          <div className="grid grid-cols-2 gap-2">
            <InfoChip icon={<Calendar className="h-4 w-4" />} label={t('detail.label.age')} value={dog.age} />
            <InfoChip icon={<Heart className="h-4 w-4" />} label={t('detail.label.gender')} value={genderLabel} />
            <InfoChip icon={<MapPin className="h-4 w-4" />} label={t('detail.label.location')} value={dog.location} />
            <InfoChip icon={<Shield className="h-4 w-4" />} label={t('detail.label.breed')} value={dog.breed} />
          </div>

          {onShowOnMap && (
            <button
              type="button"
              onClick={() => onShowOnMap(rawDog)}
              className="glass group flex w-full items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-left transition hover:border-primary/45 hover:bg-primary/15 active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <MapIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {locale === 'en' ? 'Show on map' : 'რუკაზე ჩვენება'}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {dog.location || (locale === 'en' ? 'Approximate location' : 'დაახლოებითი მდებარეობა')}
                </span>
              </span>
            </button>
          )}

          {dog.description && (
            <div className="glass rounded-xl p-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.description')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{dog.description}</p>
            </div>
          )}

          {dog.personality && (
            <div className="glass rounded-xl p-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.personality')}</h3>
              <p className="text-xs text-muted-foreground">{dog.personality}</p>
            </div>
          )}

          {dog.health && (
            <div className="glass rounded-xl p-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{t('detail.section.health')}</h3>
              <p className="text-xs text-muted-foreground">{dog.health}</p>
            </div>
          )}

          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{t('detail.section.caretaker')}</h3>
            {dog.caretakerName && <p className="text-xs text-muted-foreground">{dog.caretakerName}</p>}
            {dog.caretakerPhone ? (
              <a
                href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {dog.caretakerPhone}
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">
                {locale === 'en' ? 'Contact phone is not public.' : 'საკონტაქტო ნომერი საჯაროდ მითითებული არ არის.'}
              </p>
            )}
          </div>
        </div>

        {/* sticky bottom — always visible delete-request action */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-border/40 bg-background/60 backdrop-blur safe-area-bottom">
          <button
            onClick={handleDeleteRequest}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition active:scale-[0.98] ${
            requested
                ? 'bg-secondary text-foreground border-2 border-border'
                : !canSendDeletionRequest
                  ? 'bg-secondary/70 text-muted-foreground border-2 border-border/70 hover:bg-secondary'
                : 'bg-destructive/10 text-destructive border-2 border-destructive/30 hover:bg-destructive/20'
            }`}
            disabled={requested}
          >
            {requested ? <Check className="h-4 w-4" /> : !canSendDeletionRequest ? <AlertCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            {requested
              ? locale === 'en'
                ? 'Request sent and will be reviewed.'
                : 'მოთხოვნა გაიგზავნა და შემოწმდება.'
              : !canSendDeletionRequest
                ? locale === 'en'
                  ? 'Demo profile cannot be sent for review'
                  : 'საცდელი პროფილი admin-ში არ იგზავნება'
              : t('detail.deleteRequest')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3 flex items-start gap-2">
      <span className="text-primary mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
