import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeCard } from '@/components/SwipeCard';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { useDogs } from '@/hooks/useDogs';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { Heart, X, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Dog } from '@/data/dogs';

export default function Index() {
  const { dogs } = useDogs();
  const { likedDogs, dislikedDogs, likeDog, dislikeDog, resetDisliked } = useLikedDogs();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

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
    },
    [currentDog, likeDog, dislikeDog]
  );

  const handleReset = () => {
    resetDisliked();
    toast({ title: 'გამოტოვებული ძაღლები დაბრუნდა 🔄' });
  };

  const allSwiped = availableDogs.length === 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐾</span>
          <h1 className="text-2xl font-bold text-primary-foreground">PawSwipe</h1>
        </div>
      </div>

      {allSwiped ? (
        <div className="flex flex-col items-center justify-center glass rounded-3xl p-8 text-center max-w-sm sm:max-w-md">
          <span className="text-6xl mb-4">🐶</span>
          <h2 className="text-xl font-semibold text-primary-foreground mb-2">
            ყველა ძაღლი ნანახია!
          </h2>
          <p className="text-primary-foreground/70 mb-2 text-sm">
            ❤️ მოწონებული: {likedDogs.length} · ✕ გამოტოვებული: {dislikedDogs.length}
          </p>
          <p className="text-primary-foreground/70 mb-6 text-sm">
            შეგიძლია გამოტოვებულები დააბრუნო ან ახალი ძაღლი დაამატო
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
      ) : (
        <>
          {/* Card stack */}
          <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-[3/4]">
            <AnimatePresence>
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
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              className="glass h-14 w-14 rounded-full flex items-center justify-center text-destructive hover:scale-110 transition-transform active:scale-95"
            >
              <X className="h-7 w-7" />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="glass h-16 w-16 rounded-full flex items-center justify-center text-accent hover:scale-110 transition-transform active:scale-95"
            >
              <Heart className="h-8 w-8" fill="currentColor" />
            </button>
          </div>
        </>
      )}

      {selectedDog && (
        <DogDetailSheet
          dog={selectedDog}
          open={!!selectedDog}
          onOpenChange={open => !open && setSelectedDog(null)}
        />
      )}
    </div>
  );
}
