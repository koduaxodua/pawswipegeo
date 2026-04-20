import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, LocateFixed, Loader2, Check, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

/** Build a compact, street-level label preferring house number → road → suburb → city. */
function buildShortLabel(r: { display_name: string; address?: NominatimResult['address'] }): string {
  const a = r.address ?? {};
  const street = a.road
    ? a.house_number
      ? `${a.road} ${a.house_number}`
      : a.road
    : a.neighbourhood || a.quarter || a.suburb;
  const area = a.city || a.town || a.village;
  const parts = [street, area].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return r.display_name.split(',').slice(0, 2).join(',').trim();
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
 *  1. "Use current location" button (geolocation API + reverse geocode)
 *  2. Type-ahead search via OpenStreetMap Nominatim (Georgian / English supported)
 */
export function LocationPicker({ lat, lng, locationLabel, onChange }: LocationPickerProps) {
  const [query, setQuery] = useState(locationLabel);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
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
        url.searchParams.set('accept-language', 'ka,en');
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation არ არის ხელმისაწვდომი', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const url = new URL('https://nominatim.openstreetmap.org/reverse');
          url.searchParams.set('lat', String(latitude));
          url.searchParams.set('lon', String(longitude));
          url.searchParams.set('format', 'json');
          url.searchParams.set('addressdetails', '1');
          url.searchParams.set('zoom', '18'); // building-level precision
          url.searchParams.set('accept-language', 'ka,en');
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            label = buildShortLabel(data);
          }
        } catch {
          // keep coord label
        }
        onChange({ lat: latitude, lng: longitude, label });
        setQuery(label);
        setShowResults(false);
        toast({ title: 'მიმდინარე ლოკაცია დაყენებულია ✓' });
        setLocating(false);
      },
      err => {
        setLocating(false);
        toast({
          title: 'ვერ მოხერხდა ლოკაციის წაკითხვა',
          description: err.message,
          variant: 'destructive',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handlePickResult = (r: NominatimResult) => {
    const shortLabel = buildShortLabel(r);
    onChange({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: shortLabel });
    setQuery(shortLabel);
    setShowResults(false);
  };

  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <label className="flex items-center gap-1.5 text-sm font-medium text-primary-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        ლოკაცია რუკაზე *
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
            მდებარეობის ძებნა...
          </>
        ) : (
          <>
            <LocateFixed className="h-4 w-4" />
            ჩემი მიმდინარე ლოკაციის გამოყენება
          </>
        )}
      </button>

      <div className="text-center text-xs text-primary-foreground/40">ან მოძებნე მისამართი</div>

      {/* Search input with autocomplete (dropdown rendered in a portal to escape stacking contexts) */}
      <div ref={inputWrapRef} className="relative">
        <div className="flex items-center gap-2 border-b border-border/50 pb-1.5">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length && setShowResults(true)}
            placeholder="მაგ: ვაკე, საბურთალო, Rustaveli Ave..."
            className="w-full bg-transparent text-sm text-primary-foreground placeholder:text-muted-foreground outline-none"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && !searching && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="text-muted-foreground hover:text-primary-foreground"
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
              <div className="text-sm text-primary-foreground line-clamp-1">
                {r.display_name.split(',').slice(0, 2).join(', ')}
              </div>
              <div className="text-xs text-primary-foreground/50 line-clamp-1">
                {r.display_name}
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}

      {hasCoords && (
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <Check className="h-3 w-3" />
          კოორდინატები შენახულია: {lat!.toFixed(4)}, {lng!.toFixed(4)}
        </div>
      )}
    </div>
  );
}
