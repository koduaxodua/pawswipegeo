import { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2, Check, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    road?: string;
  };
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
  const debounceRef = useRef<number | null>(null);

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
        // Reverse geocode for human label
        let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const url = new URL('https://nominatim.openstreetmap.org/reverse');
          url.searchParams.set('lat', String(latitude));
          url.searchParams.set('lon', String(longitude));
          url.searchParams.set('format', 'json');
          url.searchParams.set('accept-language', 'ka,en');
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json();
            const a = data.address ?? {};
            const parts = [a.suburb || a.neighbourhood || a.road, a.city || a.town].filter(Boolean);
            if (parts.length) label = parts.join(', ');
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
    const a = r.address ?? {};
    const shortLabel =
      [a.suburb || a.neighbourhood || a.road, a.city || a.town].filter(Boolean).join(', ') ||
      r.display_name.split(',').slice(0, 2).join(',').trim();
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

      {/* Search input with autocomplete */}
      <div className="relative">
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

        {showResults && results.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-2 glass-strong rounded-xl border border-border max-h-64 overflow-y-auto shadow-lg">
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
          </div>
        )}
      </div>

      {hasCoords && (
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <Check className="h-3 w-3" />
          კოორდინატები შენახულია: {lat!.toFixed(4)}, {lng!.toFixed(4)}
        </div>
      )}
    </div>
  );
}
