import { useState } from 'react';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { MapPin, Phone, Trash2, Heart } from 'lucide-react';
import type { Dog } from '@/data/dogs';

export default function Favorites() {
  const { likedDogs, unlikeDog } = useLikedDogs();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-accent" fill="currentColor" />
        <h1 className="text-2xl font-bold text-primary-foreground">მოწონებული ძაღლები</h1>
      </div>

      {likedDogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center glass rounded-3xl p-8 text-center mt-12 max-w-md mx-auto">
          <span className="text-5xl mb-4">💔</span>
          <h2 className="text-lg font-semibold text-foreground mb-2">ჯერ არაფერი მოგწონებია</h2>
          <p className="text-muted-foreground text-sm">სვაიპე მარჯვნივ ან დააჭირე ❤️ რომ მოიწონო ძაღლი</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {likedDogs.map(dog => (
            <div
              key={dog.id}
              className="glass rounded-2xl p-3 flex gap-3 items-start cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => setSelectedDog(dog)}
            >
              <img
                src={dog.photo}
                alt={dog.name}
                className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{dog.name}, {dog.age}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>{dog.location}</span>
                </div>
                <a
                  href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1 text-primary text-xs mt-1"
                  onClick={e => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                  {dog.caretakerPhone}
                </a>
              </div>
              <button
                onClick={e => { e.stopPropagation(); unlikeDog(dog.id); }}
                className="p-2 text-primary-foreground/70 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
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
