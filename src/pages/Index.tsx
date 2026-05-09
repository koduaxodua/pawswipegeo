import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeCard } from '@/components/SwipeCard';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { AdBanner } from '@/components/AdBanner';
import { MapSheet } from '@/components/MapSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useDogs } from '@/hooks/useDogs';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { Heart, X, RotateCcw, Map } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/Locale';
import type { Dog } from '@/data/dogs';

const AD_FREQUENCY = 5;
const SHEET_SWITCH_DELAY_MS = 320;
const PROGRAMMATIC_SWIPE_MS = 220;

function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

export default function Index() {
  const t = useT();
  const { dogs, loading } = useDogs();
  const { likedDogs, dislikedDogs, likeDog, dislikeDog, resetDisliked } = useLikedDogs();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapFocusDogId, setMapFocusDogId] = useState<string | null>(null);
  const [swipeExitDirection, setSwipeExitDirection] = useState<'left' | 'right'>('right');
  const [activeSwipeDirection, setActiveSwipeDirection] = useState<'left' | 'right' | null>(null);

  const availableDogs = dogs.filter(
    d =>
      !likedDogs.some(l => l.id === d.id) &&
      !dislikedDogs.some(s => s.id === d.id)
  );

  const currentDog = availableDogs[0];
  const nextDog = availableDogs[1];

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentDog) return;
      setSwipeExitDirection(direction);
      if (direction === 'right') {
        likeDog(currentDog);
        toast({ title: t('index.toast.liked', { name: currentDog.name }) });
      } else {
        dislikeDog(currentDog);
      }
      setSwipeCount(prev => {
        const next = prev + 1;
        if (next % AD_FREQUENCY === 0) {
          setShowAd(true);
        }
        return next;
      });
    },
    [currentDog, likeDog, dislikeDog, t]
  );

  const handleReset = () => {
    resetDisliked();
    toast({ title: t('index.toast.reset') });
  };

  const runAnimatedSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentDog || showAd || activeSwipeDirection) return;
      setSwipeExitDirection(direction);
      setActiveSwipeDirection(direction);
      window.setTimeout(() => {
        handleSwipe(direction);
        setActiveSwipeDirection(null);
      }, PROGRAMMATIC_SWIPE_MS);
    },
    [activeSwipeDirection, currentDog, handleSwipe, showAd]
  );

  const openMap = () => {
    setMapFocusDogId(null);
    setMapOpen(true);
  };

  const handleMapOpenChange = (open: boolean) => {
    setMapOpen(open);
    if (!open) setMapFocusDogId(null);
  };

  const handleShowDogOnMap = (dog: Dog) => {
    setSelectedDog(null);
    setMapFocusDogId(dog.id);
    setTimeout(() => setMapOpen(true), SHEET_SWITCH_DELAY_MS);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || isTextEditingTarget(event.target)) return;

      if (event.key === 'ArrowDown' && selectedDog) {
        event.preventDefault();
        setSelectedDog(null);
        return;
      }

      if (selectedDog || mapOpen || showAd) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        runAnimatedSwipe('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        runAnimatedSwipe('right');
      } else if (event.key === 'ArrowUp' && currentDog) {
        event.preventDefault();
        setSelectedDog(currentDog);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDog, mapOpen, runAnimatedSwipe, selectedDog, showAd]);

  const allSwiped = availableDogs.length === 0;
  const isLoading = loading && dogs.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col items-center overflow-hidden px-4 pb-safe-nav pt-6 safe-area-top">
      {/* Header — title on left, right side cleared for the global TopRightLogo (KODUA + lang toggle) */}
      <div className="flex items-center justify-start w-full max-w-sm sm:max-w-md lg:max-w-lg flex-shrink-0 pr-topbar">
        <div className="flex min-w-0 -translate-x-1 translate-y-5 flex-col leading-tight sm:translate-y-4">
          <span className="text-base sm:text-lg font-bold text-foreground truncate">{t('app.title')}</span>
          <span className="whitespace-nowrap text-[9px] text-muted-foreground sm:text-[11px]">{t('app.tagline')}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-4 py-2">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <Skeleton className="h-[52vh] max-h-[420px] w-full rounded-3xl" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-[52px] w-[52px] rounded-full" />
            <Skeleton className="h-[52px] w-28 rounded-full" />
            <Skeleton className="h-[60px] w-[60px] rounded-full" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{t('index.loading.title')}</p>
            <p className="text-xs text-muted-foreground">{t('index.loading.sub')}</p>
          </div>
        </div>
      ) : allSwiped ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full gap-4">
          <div className="flex flex-col items-center justify-center glass rounded-3xl p-6 text-center max-w-sm sm:max-w-md">
            <span className="text-6xl mb-4">🐾</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('index.allSwiped.title')}
            </h2>
            <p className="text-muted-foreground mb-2 text-sm">
              {t('index.allSwiped.stats', { liked: likedDogs.length, disliked: dislikedDogs.length })}
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              {t('index.allSwiped.hint')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {dislikedDogs.length > 0 && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full font-medium hover:opacity-90 transition active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('index.resetDisliked')}
                </button>
              )}
              <button
                onClick={openMap}
                className="glass inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 hover:scale-105 active:scale-95 transition-transform"
                aria-label={t('index.action.map')}
              >
                <Map className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t('index.action.map')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 gap-3 py-2">
          {/* Card stack — flexible height, capped to fit on small phones */}
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex-1 min-h-0 aspect-[3/4] mx-auto" style={{ maxHeight: 'min(calc(100dvh - 320px), 70vh)' }}>
            <AnimatePresence>
              {showAd ? (
                <AdBanner key="ad" onDismiss={() => setShowAd(false)} />
              ) : (
                <>
                  {nextDog && (
                    <SwipeCard key={nextDog.id} dog={nextDog} onSwipe={() => {}} isTop={false} />
                  )}
                  {currentDog && (
                    <SwipeCard
                      key={currentDog.id}
                      dog={currentDog}
                      onSwipe={handleSwipe}
                      onTap={() => setSelectedDog(currentDog)}
                      isTop={true}
                      exitDirection={swipeExitDirection}
                      activeSwipeDirection={activeSwipeDirection}
                    />
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons + Map button row — always visible. Asymmetry is intentional (Tinder-style emphasis on Like). */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => runAnimatedSwipe('left')}
              disabled={showAd || !!activeSwipeDirection}
              className="glass flex h-[52px] w-[52px] items-center justify-center rounded-full text-destructive transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('index.action.skip')}
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={openMap}
              className="glass inline-flex h-[52px] items-center gap-1.5 rounded-full bg-primary/10 px-4 transition-transform hover:scale-105 active:scale-95"
              aria-label={t('index.action.map')}
            >
              <Map className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{t('index.action.map')}</span>
            </button>

            <button
              onClick={() => runAnimatedSwipe('right')}
              disabled={showAd || !!activeSwipeDirection}
              className="glass flex h-[60px] w-[60px] items-center justify-center rounded-full text-accent transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('index.action.like')}
            >
              <Heart className="h-7 w-7" fill="currentColor" />
            </button>
          </div>
        </div>
      )}

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
        currentDog={currentDog ?? null}
        allDogs={dogs}
        focusedDogId={mapFocusDogId}
        onSelectDog={(dog) => {
          // Close map sheet first; wait for Radix close animation (~250ms) +
          // safety margin before opening the next sheet, otherwise body's
          // pointer-events lock leaks → black screen until refresh.
          setMapOpen(false);
          setTimeout(() => setSelectedDog(dog), 450);
        }}
      />
    </div>
  );
}
