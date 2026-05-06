import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { sampleDogs, petRowToDog, type Dog } from '@/data/dogs';
import { supabase, isSupabaseConfigured, ensureAnonAuth } from '@/lib/supabase';
import { uploadPetPhoto } from '@/lib/uploadPetPhoto';
import { jitterCoordinates } from '@/lib/geo';

const CUSTOM_DOGS_KEY = 'pawswipe_custom_dogs';
const VISIBLE_SAMPLE_DOG_IDS = new Set(['1']); // Keep only Bob from the starter fake profiles.
export const PUBLIC_PET_COLUMNS = [
  'id',
  'species',
  'name',
  'age',
  'breed',
  'gender',
  'personality',
  'health',
  'location:public_location',
  'public_lat',
  'public_lng',
  'photo_url',
  'caretaker_name',
  'caretaker_phone',
  'description',
  'created_at',
].join(',');

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
        .select(PUBLIC_PET_COLUMNS)
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        if (import.meta.env.DEV) {
          console.error('[useDogs] fetch failed');
        }
      } else if (data) {
        setRemoteDogs(data.map(petRowToDog));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const dogs = useMemo(() => {
    const visibleSampleDogs = sampleDogs.filter(dog => VISIBLE_SAMPLE_DOG_IDS.has(dog.id));

    if (isSupabaseConfigured) {
      // Supabase is the source of truth; sample dogs are a starter showcase only
      return [...visibleSampleDogs, ...remoteDogs];
    }
    return [...visibleSampleDogs, ...customDogs];
  }, [customDogs, remoteDogs]);

  const addDog = useCallback(async (dog: Omit<Dog, 'id' | 'addedDate'>): Promise<Dog> => {
    // Local fallback when Supabase isn't configured
    if (!supabase) {
      const publicCoords =
        typeof dog.lat === 'number' && typeof dog.lng === 'number'
          ? jitterCoordinates(dog.lat, dog.lng)
          : null;
      const newDog: Dog = {
        ...dog,
        publicLat: publicCoords?.lat,
        publicLng: publicCoords?.lng,
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
        caretaker_phone: dog.caretakerPhone || null,
        caretaker_name: dog.caretakerName || null,
        description: dog.description || null,
        contact_consent_acknowledged_at: dog.contactConsentAcknowledgedAt ?? null,
        created_by: userId,
      })
      .select(PUBLIC_PET_COLUMNS)
      .single();

    if (error) throw error;
    const newDog = petRowToDog(data);
    setRemoteDogs(prev => [newDog, ...prev]);
    return newDog;
  }, []);

  return { dogs, addDog, loading };
}
