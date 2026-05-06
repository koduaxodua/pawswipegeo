import { useState } from 'react';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { canRequestPetDeletion, useDeleteRequests } from '@/hooks/useDeleteRequests';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { MapSheet } from '@/components/MapSheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Phone, Trash2, Heart, X, Check, AlertCircle } from 'lucide-react';
import { useLocale, useT } from '@/contexts/Locale';
import { useTranslatedDogs } from '@/hooks/useTranslatedDog';
import { toast } from '@/hooks/use-toast';
import { AdaptivePetPhoto } from '@/components/AdaptivePetPhoto';
import type { Dog } from '@/data/dogs';

export default function Favorites() {
  const t = useT();
  const { locale } = useLocale();
  const { likedDogs: rawLiked, dislikedDogs: rawDisliked, likeDog, dislikeDog } = useLikedDogs();
  const { isRequested, requestDelete } = useDeleteRequests();
  const likedDogs = useTranslatedDogs(rawLiked);
  const dislikedDogs = useTranslatedDogs(rawDisliked);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapFocusDogId, setMapFocusDogId] = useState<string | null>(null);
  const mapDogs = [...rawLiked, ...rawDisliked].filter(
    (dog, index, all) => all.findIndex(item => item.id === dog.id) === index
  );

  const handleDeletionRequest = async (dog: Dog) => {
    if (isRequested(dog.id)) return;

    if (!canRequestPetDeletion(dog.id)) {
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

  const deletionIcon = (dog: Dog) => {
    if (isRequested(dog.id)) return <Check className="h-4 w-4" />;
    if (!canRequestPetDeletion(dog.id)) return <AlertCircle className="h-4 w-4" />;
    return <Trash2 className="h-4 w-4" />;
  };

  const deletionLabel = (dog: Dog) => {
    if (isRequested(dog.id)) {
      return locale === 'en' ? 'Deletion request sent' : 'წაშლის მოთხოვნა გაგზავნილია';
    }
    return t('detail.deleteRequest');
  };

  const handleShowDogOnMap = (dog: Dog) => {
    setSelectedDog(null);
    setMapFocusDogId(dog.id);
    setTimeout(() => setMapOpen(true), 320);
  };

  const handleMapOpenChange = (open: boolean) => {
    setMapOpen(open);
    if (!open) setMapFocusDogId(null);
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6 pr-topbar">
        <Heart className="h-6 w-6 text-accent" fill="currentColor" />
        <h1 className="text-2xl font-bold text-foreground">{t('favorites.title')}</h1>
      </div>

      <Tabs defaultValue="liked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass mb-4">
          <TabsTrigger value="liked" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground hover:bg-secondary/40 transition">
            <Heart className="h-4 w-4 mr-1.5" fill="currentColor" />
            {t('favorites.tab.liked', { n: likedDogs.length })}
          </TabsTrigger>
          <TabsTrigger value="disliked" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground text-foreground hover:bg-secondary/40 transition">
            <X className="h-4 w-4 mr-1.5" />
            {t('favorites.tab.disliked', { n: dislikedDogs.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked">
          {likedDogs.length === 0 ? (
            <EmptyState
              emoji="💔"
              title={t('favorites.empty.liked.title')}
              subtitle={t('favorites.empty.liked.sub')}
            />
          ) : (
            <DogList
              dogs={likedDogs}
              onSelect={setSelectedDog}
              onAction={handleDeletionRequest}
              onSecondary={(dog) => dislikeDog(dog)}
              actionIcon={deletionIcon}
              actionLabel={deletionLabel}
              isActionDisabled={(dog) => isRequested(dog.id)}
              secondaryIcon={<X className="h-4 w-4" />}
              secondaryLabel={t('favorites.move.toDisliked')}
              showPhone
            />
          )}
        </TabsContent>

        <TabsContent value="disliked">
          {dislikedDogs.length === 0 ? (
            <EmptyState
              emoji="🐶"
              title={t('favorites.empty.disliked.title')}
              subtitle={t('favorites.empty.disliked.sub')}
            />
          ) : (
            <DogList
              dogs={dislikedDogs}
              onSelect={setSelectedDog}
              onAction={handleDeletionRequest}
              onSecondary={(dog) => likeDog(dog)}
              actionIcon={deletionIcon}
              actionLabel={deletionLabel}
              isActionDisabled={(dog) => isRequested(dog.id)}
              secondaryIcon={<Heart className="h-4 w-4" fill="currentColor" />}
              secondaryLabel={t('favorites.move.toLiked')}
            />
          )}
        </TabsContent>
      </Tabs>

      {selectedDog && (
        <DogDetailSheet
          dog={selectedDog}
          open={!!selectedDog}
          onOpenChange={open => !open && setSelectedDog(null)}
          onShowOnMap={handleShowDogOnMap}
        />
      )}

      <MapSheet
        open={mapOpen}
        onOpenChange={handleMapOpenChange}
        currentDog={selectedDog}
        allDogs={mapDogs}
        focusedDogId={mapFocusDogId}
        onSelectDog={(dog) => {
          setMapOpen(false);
          setTimeout(() => setSelectedDog(dog), 450);
        }}
      />
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center glass rounded-3xl p-6 text-center mt-8 max-w-md mx-auto">
      <span className="text-5xl mb-4">{emoji}</span>
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );
}

interface DogListProps {
  dogs: Dog[];
  onSelect: (dog: Dog) => void;
  onAction: (dog: Dog) => void;
  onSecondary?: (dog: Dog) => void;
  actionIcon: (dog: Dog) => React.ReactNode;
  actionLabel: (dog: Dog) => string;
  isActionDisabled?: (dog: Dog) => boolean;
  secondaryIcon?: React.ReactNode;
  secondaryLabel?: string;
  showPhone?: boolean;
}

function DogList({ dogs, onSelect, onAction, onSecondary, actionIcon, actionLabel, isActionDisabled, secondaryIcon, secondaryLabel, showPhone }: DogListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {dogs.map(dog => (
        <div
          key={dog.id}
          className="glass rounded-2xl p-3 flex gap-3 items-start cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => onSelect(dog)}
        >
          <AdaptivePetPhoto src={dog.photo} alt={dog.name} mode="thumb" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{dog.name}, {dog.age}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{dog.location}</span>
            </div>
            {showPhone && dog.caretakerPhone && (
              <a
                href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-1 text-primary text-xs mt-1"
                onClick={e => e.stopPropagation()}
              >
                <Phone className="h-3 w-3" />
                {dog.caretakerPhone}
              </a>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {onSecondary && (
              <button
                onClick={e => { e.stopPropagation(); onSecondary(dog); }}
                className="p-2 text-primary-foreground/70 hover:text-accent transition-colors"
                aria-label={secondaryLabel ?? 'მოქმედება'}
              >
                {secondaryIcon}
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onAction(dog); }}
              disabled={isActionDisabled?.(dog)}
              className="p-2 text-primary-foreground/70 hover:text-destructive transition-colors disabled:opacity-70 disabled:hover:text-primary-foreground/70"
              aria-label={actionLabel(dog)}
            >
              {actionIcon(dog)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
