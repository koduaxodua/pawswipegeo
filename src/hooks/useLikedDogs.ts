import { useState, useEffect, useCallback } from 'react';
import type { Dog } from '@/data/dogs';

const STORAGE_KEY = 'pawswipe_liked_dogs';
const DISLIKED_KEY = 'pawswipe_disliked_dogs';

export function useLikedDogs() {
  const [likedDogs, setLikedDogs] = useState<Dog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dislikedDogs, setDislikedDogs] = useState<Dog[]>(() => {
    try {
      const stored = localStorage.getItem(DISLIKED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(likedDogs));
  }, [likedDogs]);

  useEffect(() => {
    localStorage.setItem(DISLIKED_KEY, JSON.stringify(dislikedDogs));
  }, [dislikedDogs]);

  const likeDog = useCallback((dog: Dog) => {
    setLikedDogs(prev => {
      if (prev.some(d => d.id === dog.id)) return prev;
      return [...prev, dog];
    });
    setDislikedDogs(prev => prev.filter(d => d.id !== dog.id));
  }, []);

  const dislikeDog = useCallback((dog: Dog) => {
    setDislikedDogs(prev => {
      if (prev.some(d => d.id === dog.id)) return prev;
      return [...prev, dog];
    });
    setLikedDogs(prev => prev.filter(d => d.id !== dog.id));
  }, []);

  const unlikeDog = useCallback((dogId: string) => {
    setLikedDogs(prev => prev.filter(d => d.id !== dogId));
  }, []);

  const removeDisliked = useCallback((dogId: string) => {
    setDislikedDogs(prev => prev.filter(d => d.id !== dogId));
  }, []);

  const resetDisliked = useCallback(() => {
    setDislikedDogs([]);
  }, []);

  const isLiked = useCallback((dogId: string) => {
    return likedDogs.some(d => d.id === dogId);
  }, [likedDogs]);

  return { likedDogs, dislikedDogs, likeDog, dislikeDog, unlikeDog, removeDisliked, resetDisliked, isLiked };
}
