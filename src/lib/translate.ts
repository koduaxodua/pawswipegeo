/**
 * Free auto-translation for user-generated content (pet names, descriptions, etc).
 *
 * Uses MyMemory's free public API (no key, ~1k words/day per IP anonymously).
 * Aggressively cached in localStorage so repeat views cost nothing.
 *
 * Falls back to the original text on any error so the UI never breaks.
 */

const STORAGE_KEY = 'pawswipe_translation_cache_v1';
const ENDPOINT = 'https://api.mymemory.translated.net/get';

let cache: Record<string, string> = {};
let cacheLoaded = false;
let saveTimer: number | null = null;

function loadCache() {
  if (cacheLoaded) return;
  cacheLoaded = true;
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    cache = {};
  }
}

function saveCacheDebounced() {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // localStorage full — drop oldest half
      const entries = Object.entries(cache);
      cache = Object.fromEntries(entries.slice(entries.length / 2));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* give up */ }
    }
  }, 500);
}

/** Returns true if the string contains at least one Georgian character. */
export function isGeorgian(text: string): boolean {
  return /[\u10A0-\u10FF]/.test(text);
}

const inflight = new Map<string, Promise<string>>();

/**
 * Translate `text` to `target` (defaults to English). Skips work when the
 * source is already in the target script. Cached forever in localStorage.
 */
export async function translate(text: string, target: 'en' | 'ka' = 'en'): Promise<string> {
  if (!text) return text;
  loadCache();

  // Heuristic: skip when source is already in target script
  if (target === 'en' && !isGeorgian(text)) return text;
  if (target === 'ka' && isGeorgian(text)) return text;

  const key = `${target}:${text}`;
  const hit = cache[key];
  if (hit) return hit;

  const existing = inflight.get(key);
  if (existing) return existing;

  const source = target === 'en' ? 'ka' : 'en';
  const promise = (async () => {
    try {
      const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const translated: string = data?.responseData?.translatedText || text;
      cache[key] = translated;
      saveCacheDebounced();
      return translated;
    } catch (err) {
      // On any failure, fall back to original — UI never breaks
      console.warn('[translate] failed:', err);
      return text;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

/** Synchronous cache lookup — returns the cached translation or null. */
export function getCachedTranslation(text: string, target: 'en' | 'ka' = 'en'): string | null {
  if (!text) return null;
  loadCache();
  if (target === 'en' && !isGeorgian(text)) return text;
  if (target === 'ka' && isGeorgian(text)) return text;
  return cache[`${target}:${text}`] ?? null;
}
