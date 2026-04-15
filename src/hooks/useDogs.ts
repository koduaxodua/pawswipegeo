import { useState, useEffect } from 'react';
import { sampleDogs, type Dog } from '@/data/dogs';

const CUSTOM_DOGS_KEY = 'pawswipe_custom_dogs';

export function useDogs() {
  const [customDogs, setCustomDogs] = useState<Dog[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_DOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CUSTOM_DOGS_KEY, JSON.stringify(customDogs));
  }, [customDogs]);

  const allDogs = [...sampleDogs, ...customDogs];

  const addDog = (dog: Omit<Dog, 'id' | 'addedDate'>) => {
    const newDog: Dog = {
      ...dog,
      id: Date.now().toString(),
      addedDate: new Date().toISOString().split('T')[0],
    };
    setCustomDogs(prev => [...prev, newDog]);
    return newDog;
  };

  return { dogs: allDogs, addDog };
}
