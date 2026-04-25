import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { sampleDogs, petRowToDog, type Dog } from '@/data/dogs';
import { supabase, isSupabaseConfigured, ensureAnonAuth } from '@/lib/supabase';
import { uploadPetPhoto } from '@/lib/uploadPetPhoto';

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
  const [remoteDogs, setRemoteDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    localStorage.setItem(CUSTOM_DOGS_KEY, JSON.stringify(customDogs));
  }, [customDogs]);

  // Fetch from Supabase on mount when configured
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('[useDogs] fetch failed:', error.message);
      } else if (data) {
        setRemoteDogs(data.map(petRowToDog));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const dogs = useMemo(() => {
    if (isSupabaseConfigured) {
      // Supabase is the source of truth; sample dogs are a starter showcase only
      return [...sampleDogs, ...remoteDogs];
    }
    return [...sampleDogs, ...customDogs];
  }, [customDogs, remoteDogs]);

  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'addedDate'>): Promise<Dog> => {
    // Local fallback when Supabase isn't configured
    if (!supabase) {
      const newDog: Dog = {
        ...dog,
        id: Date.now().toString(),
        addedDate: new Date().toISOString().split('T')[0],
      };
      setCustomDogs(prev => [...prev, newDog]);
      return newDog;
    }

    const userId = await ensureAnonAuth();
    if (!userId) throw new Error('ავტენტიფიკაცია ვერ მოხერხდა');

    // If photo is a base64 data URL, upload to Storage first
    let photoUrl = dog.photo;
    if (photoUrl.startsWith('data:')) {
      photoUrl = await uploadPetPhoto(photoUrl);
    }

    const { data, error } = await supabase
      .from('pets')
      .insert({
        species: dog.species ?? 'dog',
        name: dog.name,
        age: dog.age || null,
        breed: dog.breed || null,
        gender: dog.gender,
        personality: dog.personality || null,
        health: dog.health || null,
        location: dog.location || null,
        lat: dog.lat ?? null,
        lng: dog.lng ?? null,
        photo_url: photoUrl,
        caretaker_phone: dog.caretakerPhone,
        caretaker_name: dog.caretakerName || null,
        description: dog.description || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    const newDog = petRowToDog(data);
    setRemoteDogs(prev => [newDog, ...prev]);
    return newDog;
  }, []);

  return { dogs, addDog, loading };
}
