import { useState, useEffect, useCallback } from 'react';
import type { Dog } from '@/data/dogs';

const STORAGE_KEY = 'pawswipe_liked_dogs';

export function useLikedDogs() {
  const [likedDogs, setLikedDogs] = useState<Dog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedDogs));
  }, [likedDogs]);

  const likeDog = useCallback((dog: Dog) => {
    setLikedDogs(prev => {
      if (prev.some(d => d.id === dog.id)) return prev;
      return [...prev, dog];
    });
  }, []);

  const unlikeDog = useCallback((dogId: string) => {
    setLikedDogs(prev => prev.filter(d => d.id !== dogId));
  }, []);

  const isLiked = useCallback((dogId: string) => {
    return likedDogs.some(d => d.id === dogId);
  }, [likedDogs]);

  return { likedDogs, likeDog, unlikeDog, isLiked };
}
