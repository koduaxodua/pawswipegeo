import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, LocateFixed, Loader2, Check, Search, X, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT, useLocale } from '@/contexts/Locale';

interface NominatimAddress {
  house_number?: string;
  // Streets — OSM uses different keys depending on classification
  road?: string;
  pedestrian?: string;
  residential?: string;
  path?: string;
  street?: string;
  // Neighborhood-level fallbacks
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  // City-level
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: NominatimAddress;
}

/**
 * Build a label preferring "Street + House Number" structure.
 * Falls through several OSM street-type keys before settling on a neighborhood.
 */
function buildShortLabel(r: { display_name: string; address?: NominatimAddress }): string {
  const a = r.address ?? {};
  const street = a.road || a.pedestrian || a.residential || a.street || a.path;
  const num = a.house_number;
  let line: string;
  if (street && num) line = `${street} ${num}`;
  else if (street) line = street;
  else line = a.neighbourhood || a.quarter || a.suburb || a.city_district || '';

  const area = a.city || a.town || a.village || a.hamlet;
  const parts = [line, area].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return r.display_name.split(',').slice(0, 2).join(',').trim();
}

/**
 * Layered GPS sampling — keeps watching for ~15s, returns the most accurate
 * fix seen so far. Resolves early if accuracy reaches the target threshold.
 *
 * Mobile devices typically start with cellular/Wi-Fi triangulation (~500m–
 * 5km), then improve to GPS (~5–50m) once the radio locks. A single
 * `getCurrentPosition` call often returns the first poor reading; this
 * collects several samples and keeps the best.
 */
const ACCURACY_TARGET_M = 30; // good enough — resolve immediately
const ACCURACY_POOR_M = 100; // warn the user above this
const MAX_WAIT_MS = 15000;

function getBestPosition(
  onProgress?: (acc: number) => void
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }

    let best: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let timer: number | null = null;

    const finalize = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (timer !== null) window.clearTimeout(timer);
      if (best) resolve(best);
      else reject(new Error('no fix obtained'));
    };

    watchId = navigator.geolocation.watchPosition(
      pos => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) {
          best = pos;
          onProgress?.(pos.coords.accuracy);
        }
        if (pos.coords.accuracy <= ACCURACY_TARGET_M) {
          finalize();
        }
      },
      err => {
        // GPS error mid-watch — settle with whatever we have, or reject
        if (best) finalize();
        else {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          if (timer !== null) window.clearTimeout(timer);
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: MAX_WAIT_MS, maximumAge: 0 }
    );

    timer = window.setTimeout(finalize, MAX_WAIT_MS);
  });
}

/**
 * Reverse geocode with multiple zoom-level fallbacks. Zoom=18 returns
 * building-level precision when available; falls back to 17, 16 for areas
 * without a registered street/number.
 */
async function reverseGeocode(
  lat: number,
  lon: number,
  lang: string
): Promise<NominatimResult | null> {
  let lastResult: NominatimResult | null = null;
  for (const zoom of [18, 17, 16]) {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('zoom', String(zoom));
      url.searchParams.set('accept-language', lang);
      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const data: NominatimResult = await res.json();
      lastResult = data;
      // Prefer the first zoom that returns a real street + number.
      if (data.address?.road && data.address?.house_number) return data;
    } catch {
      // try next zoom
    }
  }
  return lastResult;
}

interface LocationPickerProps {
  /** Currently chosen lat/lng (from parent form) */
  lat?: number;
  lng?: number;
  /** Free-form location label shown in the dog card */
  locationLabel: string;
  onChange: (data: { lat: number; lng: number; label: string }) => void;
}

/**
 * Combined location picker:
 *  1. "Use current location" button — multi-sample GPS + multi-zoom geocode
 *  2. Type-ahead search via OpenStreetMap Nominatim (Georgian / English supported)
 */
export function LocationPicker({ lat, lng, locationLabel, onChange }: LocationPickerProps) {
  const t = useT();
  const { locale } = useLocale();
  const [query, setQuery] = useState(locationLabel);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [progressAcc, setProgressAcc] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  // Position the portal dropdown right under the input, in viewport coords
  useLayoutEffect(() => {
    if (!showResults || !inputWrapRef.current) return;
    const updateRect = () => {
      const r = inputWrapRef.current!.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [showResults, results.length]);

  // Close on outside click
  useEffect(() => {
    if (!showResults) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inputWrapRef.current && !inputWrapRef.current.contains(target)) {
        // Allow clicks inside the portal dropdown — they have data attribute
        if (!(target instanceof HTMLElement && target.closest('[data-location-dropdown]'))) {
          setShowResults(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showResults]);

  // Keep input in sync if parent label changes (e.g. via GPS button)
  useEffect(() => {
    setQuery(locationLabel);
  }, [locationLabel]);

  // Debounced Nominatim search — bounded to Georgia for relevance
  useEffect(() => {
    if (!query || query.trim().length < 2 || query === locationLabel) {
      setResults([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');
        url.searchParams.set('countrycodes', 'ge');
        url.searchParams.set('accept-language', locale === 'en' ? 'en,ka' : 'ka,en');
        const res = await fetch(url.toString(), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setResults(data);
          setShowResults(true);
        }
      } catch {
        // silent
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, locationLabel]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: t('loc.gpsBlocked'), variant: 'destructive' });
      return;
    }
    setLocating(true);
    setProgressAcc(null);
    setAccuracy(null);
    try {
      const pos = await getBestPosition(setProgressAcc);
      const { latitude, longitude, accuracy: acc } = pos.coords;

      // High-precision fallback label
      let label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      const data = await reverseGeocode(
        latitude,
        longitude,
        locale === 'en' ? 'en,ka' : 'ka,en'
      );
      if (data) label = buildShortLabel(data);

      onChange({ lat: latitude, lng: longitude, label });
      setQuery(label);
      setAccuracy(acc);
      setShowResults(false);

      const accRounded = Math.round(acc);
      if (acc > ACCURACY_POOR_M) {
        toast({
          title:
            locale === 'en'
              ? `Location set, but accuracy is poor (±${accRounded}m). Refine via search.`
              : `ლოკაცია დაყენდა, მაგრამ სიზუსტე დაბალია (±${accRounded}მ). ძებნით დააზუსტე.`,
        });
      } else {
        toast({
          title:
            locale === 'en'
              ? `Current location ✓ ±${accRounded}m`
              : `მიმდინარე ლოკაცია ✓ ±${accRounded}მ`,
        });
      }
    } catch (err) {
      toast({
        title: t('loc.gpsFailed'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setLocating(false);
      setProgressAcc(null);
    }
  };

  const handlePickResult = (r: NominatimResult) => {
    const shortLabel = buildShortLabel(r);
    onChange({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: shortLabel });
    setQuery(shortLabel);
    setAccuracy(null); // search results have no GPS accuracy concept
    setShowResults(false);
  };

  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const isPoorAccuracy = accuracy !== null && accuracy > ACCURACY_POOR_M;

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        {t('loc.title')}
      </label>

      {/* Current location button — primary action */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60"
      >
        {locating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progressAcc !== null
              ? locale === 'en'
                ? `Refining ±${Math.round(progressAcc)}m...`
                : `ვაზუსტებ ±${Math.round(progressAcc)}მ...`
              : t('loc.locating')}
          </>
        ) : (
          <>
            <LocateFixed className="h-4 w-4" />
            {t('loc.useGPS')}
          </>
        )}
      </button>

      <div className="text-center text-xs text-muted-foreground">
        {locale === 'en' ? 'or search address' : 'ან მოძებნე მისამართი'}
      </div>

      {/* Search input with autocomplete (dropdown rendered in a portal to escape stacking contexts) */}
      <div ref={inputWrapRef} className="relative">
        <div className="flex items-center gap-2 border-b border-border/50 pb-1.5">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length && setShowResults(true)}
            placeholder={t('loc.search')}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && !searching && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && dropdownRect && createPortal(
        <div
          data-location-dropdown
          className="fixed glass-strong rounded-xl border border-border max-h-64 overflow-y-auto shadow-2xl"
          style={{
            top: dropdownRect.top,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
        >
          {results.map(r => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => handlePickResult(r)}
              className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition border-b border-border/30 last:border-0"
            >
              <div className="text-sm text-foreground line-clamp-1">
                {buildShortLabel(r) || r.display_name.split(',').slice(0, 2).join(', ')}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {r.display_name}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}

      {hasCoords && (
        <div
          className={`flex items-center gap-1.5 text-xs ${
            isPoorAccuracy ? 'text-yellow-500' : 'text-primary'
          }`}
        >
          {isPoorAccuracy ? (
            <AlertTriangle className="h-3.5 w-3.5" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>
            {t('loc.selected')} {lat!.toFixed(5)}, {lng!.toFixed(5)}
            {accuracy !== null && (
              <span className="text-muted-foreground"> · ±{Math.round(accuracy)}{locale === 'en' ? 'm' : 'მ'}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
