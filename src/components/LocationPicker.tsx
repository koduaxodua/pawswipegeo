import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, LocateFixed, Loader2, Check, Search, X, AlertTriangle, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useT, useLocale } from '@/contexts/Locale';
import { DEFAULT_CENTER } from '@/data/locations';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  residential?: string;
  path?: string;
  street?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
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

const ACCURACY_TARGET_M = 30;
const ACCURACY_POOR_M = 100;
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
        if (pos.coords.accuracy <= ACCURACY_TARGET_M) finalize();
      },
      err => {
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
      if (data.address?.road && data.address?.house_number) return data;
    } catch {
      // try next
    }
  }
  return lastResult;
}

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  locationLabel: string;
  /** When the photo's EXIF GPS matches the current lat/lng, show a badge. */
  photoExif?: { lat: number; lng: number } | null;
  onChange: (data: { lat: number; lng: number; label: string }) => void;
}

/**
 * Pin-drop location picker — taxi-app style:
 *  - Pin is a fixed CSS overlay at the center of the map.
 *  - User pans/zooms the MAP, the pin tip lands on whatever's underneath.
 *  - On every map idle, reverse-geocode and update the parent.
 *
 *  Plus:
 *   - GPS button (multi-sample, accuracy-aware) for quick start
 *   - Search input with autocomplete (Nominatim)
 *   - "Photo taken here" badge when current lat/lng matches photo EXIF GPS
 */
export function LocationPicker({ lat, lng, locationLabel, photoExif, onChange }: LocationPickerProps) {
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
  const [reverseLoading, setReverseLoading] = useState(false);
  const [moving, setMoving] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const reverseDebounceRef = useRef<number | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Suppresses moveend handling while we recenter programmatically (GPS / search)
  const programmaticRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const localeRef = useRef(locale);
  localeRef.current = locale;
  // Keep the most recent props in refs so the (stable) map init / event handlers
  // can read them without forcing the callback ref to change identity. Changing
  // setMapNode's identity would tear down and rebuild the map on every prop change
  // (e.g. when EXIF auto-fills lat/lng), which caused a black screen.
  const initialPosRef = useRef<{ lat?: number; lng?: number }>({ lat, lng });
  initialPosRef.current = { lat, lng };

  const reverseAndUpdate = useCallback((newLat: number, newLng: number) => {
    if (!Number.isFinite(newLat) || !Number.isFinite(newLng)) return;
    if (reverseDebounceRef.current) window.clearTimeout(reverseDebounceRef.current);
    setReverseLoading(true);
    reverseDebounceRef.current = window.setTimeout(async () => {
      let label = `${newLat.toFixed(5)}, ${newLng.toFixed(5)}`;
      const data = await reverseGeocode(
        newLat,
        newLng,
        localeRef.current === 'en' ? 'en,ka' : 'ka,en'
      );
      if (data) label = buildShortLabel(data) || label;
      onChangeRef.current({ lat: newLat, lng: newLng, label });
      setQuery(label);
      setReverseLoading(false);
    }, 400);
  }, []);
  const reverseAndUpdateRef = useRef(reverseAndUpdate);
  reverseAndUpdateRef.current = reverseAndUpdate;

  // Stable callback ref — created with [] deps so React never rebinds it,
  // which means the map is created exactly once when the DOM mounts and torn
  // down only when the component unmounts.
  const setMapNode = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (!node) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }
    if (mapRef.current) return;

    const { lat: initLat, lng: initLng } = initialPosRef.current;
    const initialCenter: L.LatLngTuple =
      typeof initLat === 'number' && typeof initLng === 'number'
        ? [initLat, initLng]
        : DEFAULT_CENTER;

    const map = L.map(node, {
      center: initialCenter,
      zoom: typeof initLat === 'number' ? 17 : 12,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    map.on('movestart', () => setMoving(true));
    map.on('moveend', () => {
      setMoving(false);
      if (programmaticRef.current) {
        programmaticRef.current = false;
        return;
      }
      const c = map.getCenter();
      reverseAndUpdateRef.current(c.lat, c.lng);
    });

    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 350);
  }, []);

  // When parent lat/lng changes (GPS button, search, EXIF), fly the map there.
  // The moveend handler suppresses self-update via programmaticRef.
  // Guard against NaN/Infinity — Leaflet throws "Invalid LatLng object" otherwise.
  useEffect(() => {
    if (!mapRef.current) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const center = mapRef.current.getCenter();
    if (Math.abs(center.lat - (lat as number)) < 1e-6 && Math.abs(center.lng - (lng as number)) < 1e-6) return;
    programmaticRef.current = true;
    mapRef.current.flyTo([lat as number, lng as number], 17, { duration: 0.6 });
  }, [lat, lng]);

  // Search dropdown positioning
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

  useEffect(() => {
    if (!showResults) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inputWrapRef.current && !inputWrapRef.current.contains(target)) {
        if (!(target instanceof HTMLElement && target.closest('[data-location-dropdown]'))) {
          setShowResults(false);
        }
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showResults]);

  useEffect(() => {
    setQuery(locationLabel);
  }, [locationLabel]);

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
        const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
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
      let label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      const data = await reverseGeocode(
        latitude,
        longitude,
        locale === 'en' ? 'en,ka' : 'ka,en'
      );
      if (data) label = buildShortLabel(data) || label;

      onChange({ lat: latitude, lng: longitude, label });
      setQuery(label);
      setAccuracy(acc);
      setShowResults(false);

      const accRounded = Math.round(acc);
      if (acc > ACCURACY_POOR_M) {
        toast({
          title:
            locale === 'en'
              ? `±${accRounded}m — pan the map to refine`
              : `±${accRounded}მ — გადააადგილე რუკა, რომ დააზუსტო`,
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
    setAccuracy(null);
    setShowResults(false);
  };

  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const isPoorAccuracy = accuracy !== null && accuracy > ACCURACY_POOR_M;
  // Stays true while the lat/lng exactly match the EXIF reading
  const isPhotoLocation =
    photoExif !== null &&
    photoExif !== undefined &&
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Math.abs(lat - photoExif.lat) < 1e-6 &&
    Math.abs(lng - photoExif.lng) < 1e-6;

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        {t('loc.title')}
      </label>

      {/* GPS quick-start button */}
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

      {/* Pin-in-center / map-moves picker */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground">
          {locale === 'en'
            ? 'Move the map — the pin marks the exact spot'
            : 'გადააადგილე რუკა — pin-ი ზუსტ ადგილს მონიშნავს'}
        </p>
        <div className="relative h-60 rounded-xl overflow-hidden border border-border/50 bg-secondary touch-none">
          <div ref={setMapNode} className="absolute inset-0 z-0" />

          {/* Centered pin — pure CSS overlay, no Leaflet marker */}
          <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center">
            <div
              className={`relative -translate-y-3 transition-transform ${
                moving ? '-translate-y-5 scale-110' : ''
              }`}
            >
              {/* drop-shadow grows when lifted (during pan) */}
              <div
                className={`absolute left-1/2 top-full h-1.5 w-5 -translate-x-1/2 rounded-full bg-black/40 blur-sm transition-all ${
                  moving ? 'w-6 opacity-70' : 'opacity-50'
                }`}
              />
              {/* the pin itself — orange teardrop */}
              <div
                className="rotate-[-45deg] rounded-tr-full rounded-tl-full rounded-br-full border-[3px] border-white shadow-lg"
                style={{
                  width: 30,
                  height: 30,
                  background: 'hsl(36, 89%, 54%)',
                }}
              >
                <div
                  className="absolute rounded-full bg-white"
                  style={{ top: 8, left: 8, width: 11, height: 11 }}
                />
              </div>
            </div>
          </div>

          {/* "Resolving..." chip while geocoding */}
          {reverseLoading && !moving && (
            <div className="absolute top-2 right-2 z-[500] bg-background/80 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] text-foreground shadow">
              <Loader2 className="h-3 w-3 animate-spin" />
              {locale === 'en' ? 'Resolving...' : 'მისამართი იძებნება...'}
            </div>
          )}
        </div>

        {/* Photo-EXIF badge — shown only while the chosen lat/lng matches the photo */}
        {isPhotoLocation && (
          <p className="flex items-center gap-1.5 text-[11px] text-primary">
            <Camera className="h-3 w-3" />
            {locale === 'en'
              ? 'Photo was taken at this location'
              : 'ფოტო გადაღებულია ამ ლოკაციაზე'}
          </p>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground">
        {locale === 'en' ? 'or search address' : 'ან მოძებნე მისამართი'}
      </div>

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
