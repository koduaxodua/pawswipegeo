import { useState } from 'react';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, Phone, Trash2, Heart, X, RotateCcw } from 'lucide-react';
import type { Dog } from '@/data/dogs';

export default function Favorites() {
  const { likedDogs, dislikedDogs, unlikeDog, removeDisliked, likeDog } = useLikedDogs();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-accent" fill="currentColor" />
        <h1 className="text-2xl font-bold text-primary-foreground">ჩემი არჩევანი</h1>
      </div>

      <Tabs defaultValue="liked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass mb-4">
          <TabsTrigger value="liked" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-primary-foreground">
            <Heart className="h-4 w-4 mr-1.5" fill="currentColor" />
            მოწონებული ({likedDogs.length})
          </TabsTrigger>
          <TabsTrigger value="disliked" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground text-primary-foreground">
            <X className="h-4 w-4 mr-1.5" />
            დაწუნებული ({dislikedDogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked">
          {likedDogs.length === 0 ? (
            <EmptyState
              emoji="💔"
              title="ჯერ არაფერი მოგწონებია"
              subtitle="სვაიპე მარჯვნივ ან დააჭირე ❤️ რომ მოიწონო ძაღლი"
            />
          ) : (
            <DogList
              dogs={likedDogs}
              onSelect={setSelectedDog}
              onAction={unlikeDog}
              actionIcon={<Trash2 className="h-4 w-4" />}
              showPhone
            />
          )}
        </TabsContent>

        <TabsContent value="disliked">
          {dislikedDogs.length === 0 ? (
            <EmptyState
              emoji="🐶"
              title="არცერთი ძაღლი არ დაგიწუნებია"
              subtitle="აქ აისახება ის ძაღლები, რომლებსაც მარცხნივ სვაიპავ"
            />
          ) : (
            <DogList
              dogs={dislikedDogs}
              onSelect={setSelectedDog}
              onAction={removeDisliked}
              onSecondary={(dog) => likeDog(dog)}
              actionIcon={<Trash2 className="h-4 w-4" />}
              secondaryIcon={<RotateCcw className="h-4 w-4" />}
            />
          )}
        </TabsContent>
      </Tabs>

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

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center glass rounded-3xl p-8 text-center mt-8 max-w-md mx-auto">
      <span className="text-5xl mb-4">{emoji}</span>
      <h2 className="text-lg font-semibold text-primary-foreground mb-2">{title}</h2>
      <p className="text-primary-foreground/70 text-sm">{subtitle}</p>
    </div>
  );
}

interface DogListProps {
  dogs: Dog[];
  onSelect: (dog: Dog) => void;
  onAction: (id: string) => void;
  onSecondary?: (dog: Dog) => void;
  actionIcon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  showPhone?: boolean;
}

function DogList({ dogs, onSelect, onAction, onSecondary, actionIcon, secondaryIcon, showPhone }: DogListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {dogs.map(dog => (
        <div
          key={dog.id}
          className="glass rounded-2xl p-3 flex gap-3 items-start cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => onSelect(dog)}
        >
          <img
            src={dog.photo}
            alt={dog.name}
            className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary-foreground">{dog.name}, {dog.age}</h3>
            <div className="flex items-center gap-1 text-primary-foreground/70 text-xs mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{dog.location}</span>
            </div>
            {showPhone && (
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
                aria-label="გადატანა მოწონებულებში"
              >
                {secondaryIcon}
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onAction(dog.id); }}
              className="p-2 text-primary-foreground/70 hover:text-destructive transition-colors"
              aria-label="წაშლა"
            >
              {actionIcon}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
