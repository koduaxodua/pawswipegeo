import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeCard } from '@/components/SwipeCard';
import { useDogs } from '@/hooks/useDogs';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { Heart, X, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const { dogs } = useDogs();
  const { likeDog } = useLikedDogs();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDog = dogs[currentIndex];
  const nextDog = dogs[currentIndex + 1];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'right' && currentDog) {
      likeDog(currentDog);
      toast({ title: `${currentDog.name} მოწონებულია! ❤️` });
    }
    setCurrentIndex(prev => prev + 1);
  }, [currentDog, likeDog]);

  const handleReset = () => setCurrentIndex(0);

  const allSwiped = currentIndex >= dogs.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-20 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">🐾</span>
        <h1 className="text-2xl font-bold text-foreground">PawSwipe</h1>
      </div>

      {allSwiped ? (
        <div className="flex flex-col items-center justify-center glass rounded-3xl p-8 text-center max-w-sm">
          <span className="text-6xl mb-4">🐶</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">ყველა ძაღლი ნანახია!</h2>
          <p className="text-muted-foreground mb-6">შეგიძლია თავიდან დაიწყო ან ახალი ძაღლი დაამატო</p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            <RotateCcw className="h-4 w-4" />
            თავიდან დაწყება
          </button>
        </div>
      ) : (
        <>
          {/* Card stack */}
          <div className="relative w-full max-w-sm aspect-[3/4]">
            <AnimatePresence>
              {nextDog && (
                <SwipeCard key={nextDog.id} dog={nextDog} onSwipe={() => {}} isTop={false} />
              )}
              {currentDog && (
                <SwipeCard key={currentDog.id} dog={currentDog} onSwipe={handleSwipe} isTop={true} />
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
    </div>
  );
}
