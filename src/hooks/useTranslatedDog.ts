import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/Locale';
import { translate, isGeorgian, getCachedTranslation } from '@/lib/translate';
import type { Dog } from '@/data/dogs';

const FIELDS: ReadonlyArray<keyof Dog> = [
  'name',
  'age',
  'breed',
  'personality',
  'health',
  'location',
  'description',
  'caretakerName',
];

/** Synchronously apply any cached translations to a Dog (no network). */
function applyCached(dog: Dog, target: 'en' | 'ka'): Dog {
  const updates: Record<string, string> = {};
  for (const field of FIELDS) {
    const val = dog[field];
    if (typeof val === 'string' && val) {
      const cached = getCachedTranslation(val, target);
      if (cached !== null && cached !== val) {
        updates[field] = cached;
      }
    }
  }
  return Object.keys(updates).length ? { ...dog, ...updates } : dog;
}

async function translateDog(dog: Dog, target: 'en' | 'ka'): Promise<Dog> {
  const updates: Record<string, string> = {};
  await Promise.all(
    FIELDS.map(async field => {
      const val = dog[field];
      if (typeof val === 'string' && val && isGeorgian(val) === (target === 'en')) {
        const tr = await translate(val, target);
        if (tr !== val) updates[field] = tr;
      }
    })
  );
  return Object.keys(updates).length ? { ...dog, ...updates } : dog;
}

/** Returns the dog with user-text fields translated to the active locale. */
export function useTranslatedDog(dog: Dog | null): Dog | null {
  const { locale } = useLocale();
  const [translated, setTranslated] = useState<Dog | null>(() =>
    dog && locale === 'en' ? applyCached(dog, 'en') : dog
  );

  useEffect(() => {
    if (!dog) {
      setTranslated(null);
      return;
    }
    if (locale !== 'en') {
      setTranslated(dog);
      return;
    }
    setTranslated(applyCached(dog, 'en'));
    let cancelled = false;
    translateDog(dog, 'en').then(next => {
      if (!cancelled) setTranslated(next);
    });
    return () => {
      cancelled = true;
    };
  }, [dog, locale]);

  return translated;
}

/** Same as useTranslatedDog, but for arrays. */
export function useTranslatedDogs(dogs: Dog[]): Dog[] {
  const { locale } = useLocale();
  const [translated, setTranslated] = useState<Dog[]>(() =>
    locale === 'en' ? dogs.map(d => applyCached(d, 'en')) : dogs
  );

  useEffect(() => {
    if (locale !== 'en') {
      setTranslated(dogs);
      return;
    }
    setTranslated(dogs.map(d => applyCached(d, 'en')));
    let cancelled = false;
    (async () => {
      const next = await Promise.all(dogs.map(d => translateDog(d, 'en')));
      if (!cancelled) setTranslated(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [dogs, locale]);

  return translated;
}
