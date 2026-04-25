import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeCard } from '@/components/SwipeCard';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { AdBanner } from '@/components/AdBanner';
import { MapSheet } from '@/components/MapSheet';
import { useDogs } from '@/hooks/useDogs';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { Heart, X, RotateCcw, Map } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import type { Dog } from '@/data/dogs';

const AD_FREQUENCY = 5;

export default function Index() {
  const { dogs } = useDogs();
  const { likedDogs, dislikedDogs, likeDog, dislikeDog, resetDisliked } = useLikedDogs();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

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
      if (direction === 'right') {
        likeDog(currentDog);
        toast({ title: `${currentDog.name} მოწონებულია! ❤️` });
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
    [currentDog, likeDog, dislikeDog]
  );

  const handleReset = () => {
    resetDisliked();
    toast({ title: 'გამოტოვებული ძაღლები დაბრუნდა 🔄' });
  };

  const allSwiped = availableDogs.length === 0;

  return (
    <div className="flex flex-col items-center h-[100dvh] px-4 pt-3 pb-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-foreground">Pet Rescue Georgia</span>
            <span className="text-[11px] text-muted-foreground">მიუსაფარი ცხოველების მიკედლება</span>
          </div>
        </div>
      </div>

      {allSwiped ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center glass rounded-3xl p-8 text-center max-w-sm sm:max-w-md">
            <span className="text-6xl mb-4">🐾</span>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              ყველა ცხოველი ნანახია!
            </h2>
            <p className="text-muted-foreground mb-2 text-sm">
              ❤️ მოწონებული: {likedDogs.length} · ✕ გამოტოვებული: {dislikedDogs.length}
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              შეგიძლია გამოტოვებულები დააბრუნო ან ახალი ცხოველი დაამატო
            </p>
            {dislikedDogs.length > 0 && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
              >
                <RotateCcw className="h-4 w-4" />
                გამოტოვებულების დაბრუნება
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 gap-3 py-2">
          {/* Card stack — flexible height, capped to fit */}
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex-1 min-h-0 aspect-[3/4] mx-auto" style={{ maxHeight: 'min(calc(100dvh - 280px), 70vh)' }}>
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
                    />
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons + Map button row — always visible */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => handleSwipe('left')}
              disabled={showAd}
              className="glass h-13 w-13 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-destructive hover:scale-110 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="გამოტოვება"
              style={{ height: 52, width: 52 }}
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={() => setMapOpen(true)}
              className="glass inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-foreground hover:scale-105 active:scale-95 transition-transform"
              aria-label="რუკის ნახვა"
            >
              <Map className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">რუკა</span>
            </button>

            <button
              onClick={() => handleSwipe('right')}
              disabled={showAd}
              className="glass rounded-full flex items-center justify-center text-accent hover:scale-110 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="მოწონება"
              style={{ height: 60, width: 60 }}
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
        />
      )}

      <MapSheet
        open={mapOpen}
        onOpenChange={setMapOpen}
        currentDog={currentDog ?? null}
        allDogs={dogs}
        onSelectDog={(dog) => {
          setMapOpen(false);
          setTimeout(() => setSelectedDog(dog), 250);
        }}
      />
    </div>
  );
}
