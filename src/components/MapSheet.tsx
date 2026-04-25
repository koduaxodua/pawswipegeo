import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Dog } from '@/data/dogs';
import { DEFAULT_CENTER, getDogCoords } from '@/data/locations';
import { haversineKm, formatDistance } from '@/lib/geo';
import { useT } from '@/contexts/Locale';
import { MapPin, Crosshair } from 'lucide-react';

interface MapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDog: Dog | null;
  allDogs: Dog[];
  onSelectDog?: (dog: Dog) => void;
}

type DotState = 'default' | 'current' | 'selected';

const dotStyle = (state: DotState): L.PathOptions & { radius: number } => {
  if (state === 'selected') {
    return { radius: 18, fillColor: 'hsl(36, 89%, 54%)', fillOpacity: 1, color: '#fff', weight: 4, opacity: 1 };
  }
  if (state === 'current') {
    return { radius: 14, fillColor: 'hsl(283, 49%, 53%)', fillOpacity: 1, color: '#fff', weight: 4, opacity: 1 };
  }
  return { radius: 11, fillColor: 'hsl(283, 49%, 53%)', fillOpacity: 1, color: '#fff', weight: 3, opacity: 1 };
};

const userStyle: L.PathOptions & { radius: number } = {
  radius: 9,
  fillColor: '#3b82f6',
  fillOpacity: 1,
  color: '#fff',
  weight: 3,
  opacity: 1,
};

export function MapSheet({ open, onOpenChange, currentDog, allDogs, onSelectDog }: MapSheetProps) {
  const t = useT();
  const [map, setMap] = useState<L.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, L.CircleMarker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get user location once when sheet opens
  useEffect(() => {
    if (!open || userLocation) return;
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [open, userLocation]);

  // Reset selection when sheet closes
  useEffect(() => {
    if (!open) {
      setSelectedId(null);
    }
  }, [open]);

  // Init map via callback ref — fires when DOM node mounts
  const setContainer = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      setMap(prev => {
        prev?.remove();
        markersRef.current.clear();
        userMarkerRef.current = null;
        return null;
      });
      return;
    }
    setMap(prev => {
      if (prev) return prev;
      const m = L.map(node, {
        center: DEFAULT_CENTER,
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(m);
      // size correction once in DOM
      requestAnimationFrame(() => m.invalidateSize());
      setTimeout(() => m.invalidateSize(), 350);
      return m;
    });
  }, []);

  // ResizeObserver — keep map sized correctly while sheet animates
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  // Create dog markers when map or dataset changes (one-shot per allDogs)
  useEffect(() => {
    if (!map) return;

    // Wipe any existing markers and rebuild — robust against state churn
    markersRef.current.forEach(m => {
      try { m.remove(); } catch { /* ignore */ }
    });
    markersRef.current.clear();

    allDogs.forEach(dog => {
      const [lat, lng] = getDogCoords(dog);
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;

      try {
        const m = L.circleMarker([lat, lng], dotStyle('default')).addTo(map);
        m.bindTooltip(dog.name, { direction: 'top', offset: [0, -8], opacity: 0.95 });
        m.on('click', () => setSelectedId(dog.id));
        markersRef.current.set(dog.id, m);
      } catch (err) {
        console.warn('[MapSheet] failed to add marker for', dog.id, err);
      }
    });

    return () => {
      markersRef.current.forEach(m => {
        try { m.remove(); } catch { /* ignore */ }
      });
      markersRef.current.clear();
    };
  }, [map, allDogs]);

  // Update marker styles based on selection — never recreates markers
  useEffect(() => {
    if (!map) return;
    markersRef.current.forEach((marker, id) => {
      const state: DotState =
        selectedId === id ? 'selected' : currentDog?.id === id ? 'current' : 'default';
      try {
        marker.setStyle(dotStyle(state));
        if (state === 'selected') marker.bringToFront();
      } catch (err) {
        console.warn('[MapSheet] setStyle failed', err);
      }
    });
  }, [map, selectedId, currentDog]);

  // Sync user location marker
  useEffect(() => {
    if (!map || !userLocation) return;
    if (userMarkerRef.current) {
      try { userMarkerRef.current.setLatLng(userLocation); } catch { /* ignore */ }
    } else {
      try {
        userMarkerRef.current = L.circleMarker(userLocation, userStyle).addTo(map);
        userMarkerRef.current.bindTooltip('თქვენ', { direction: 'top', offset: [0, -10] });
      } catch (err) {
        console.warn('[MapSheet] user marker failed', err);
      }
    }
  }, [map, userLocation]);

  // Fit bounds to all points when sheet opens or dataset changes
  useEffect(() => {
    if (!map || !open) return;
    const points: L.LatLngTuple[] = allDogs
      .map(d => getDogCoords(d) as L.LatLngTuple)
      .filter(([la, ln]) => typeof la === 'number' && !isNaN(la) && typeof ln === 'number' && !isNaN(ln));
    if (userLocation) points.push(userLocation as L.LatLngTuple);
    if (points.length === 0) return;
    const id = setTimeout(() => {
      if (selectedId) return; // keep zoom on selection
      if (points.length === 1) {
        map.setView(points[0], 14);
      } else {
        map.fitBounds(L.latLngBounds(points).pad(0.2), { animate: false, maxZoom: 14 });
      }
      map.invalidateSize();
    }, 380);
    return () => clearTimeout(id);
  }, [map, open, allDogs.length, userLocation, selectedId]);

  // Fly to selected dog
  useEffect(() => {
    if (!map || !selectedId) return;
    const dog = allDogs.find(d => d.id === selectedId);
    if (!dog) return;
    map.flyTo(getDogCoords(dog), 16, { duration: 0.7 });
  }, [map, selectedId, allDogs]);

  // Sorted list with distances
  const refPoint: [number, number] = userLocation ?? DEFAULT_CENTER;
  const sortedDogs = useMemo(() => {
    return [...allDogs]
      .map(dog => ({ dog, distance: haversineKm(refPoint, getDogCoords(dog)) }))
      .sort((a, b) => a.distance - b.distance);
  }, [allDogs, refPoint[0], refPoint[1]]);

  const handleListClick = (dog: Dog) => {
    setSelectedId(dog.id);
  };

  // Auto-scroll selected list item into view
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-dog-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] p-0 glass-strong border-t border-border flex flex-col">
        <SheetHeader className="px-4 pt-3 pb-2 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-foreground text-base">
            <MapPin className="h-5 w-5 text-primary" />
            {t('map.title', { n: allDogs.length })}
            {locating && (
              <span className="text-xs text-muted-foreground ml-auto font-normal">
                {t('map.locating')}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* MAP — takes ~60% of remaining height */}
        <div className="flex-[1.5] relative overflow-hidden bg-secondary min-h-0">
          {open && <div ref={setContainer} className="absolute inset-0 z-0" />}

          {/* Re-center to user button */}
          {userLocation && (
            <button
              onClick={() => map?.flyTo(userLocation, 14, { duration: 0.6 })}
              className="absolute top-3 right-3 z-[1000] glass h-10 w-10 rounded-full flex items-center justify-center text-foreground hover:scale-105 transition"
              aria-label={t('map.recenter')}
            >
              <Crosshair className="h-5 w-5 text-primary" />
            </button>
          )}

          {/* Selected pet pop-card */}
          {selectedId && (() => {
            const dog = allDogs.find(d => d.id === selectedId);
            if (!dog) return null;
            return (
              <button
                onClick={() => onSelectDog?.(dog)}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] glass-strong rounded-2xl p-2.5 pr-4 flex items-center gap-3 shadow-2xl active:scale-[0.98] transition max-w-[88%]"
              >
                <img src={dog.photo} alt={dog.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-foreground truncate">{dog.name}, {dog.age}</div>
                  <div className="text-xs text-muted-foreground truncate">{dog.location}</div>
                  <div className="text-[11px] text-primary mt-0.5">{t('map.popcard.hint')}</div>
                </div>
              </button>
            );
          })()}
        </div>

        {/* LIST — nearest dogs */}
        <div className="flex-1 min-h-0 border-t border-border/50 bg-background/90 backdrop-blur flex flex-col">
          <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex-shrink-0">
            {userLocation ? t('map.list.nearby') : t('map.list.all')}
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
            {sortedDogs.map(({ dog, distance }) => {
              const isSelected = selectedId === dog.id;
              const isCurrent = currentDog?.id === dog.id;
              return (
                <button
                  key={dog.id}
                  data-dog-id={dog.id}
                  onClick={() => handleListClick(dog)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-primary/15 border-primary/40'
                      : isCurrent
                      ? 'bg-accent/10 border-accent/30'
                      : 'border-transparent hover:bg-secondary/40'
                  }`}
                >
                  <img
                    src={dog.photo}
                    alt={dog.name}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {isCurrent && '⭐ '}{dog.name}, {dog.age}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {dog.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <div className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                      {formatDistance(distance, { meters: t('map.unitMeters'), km: t('map.unitKm') })}
                    </div>
                    {userLocation && (
                      <div className="text-[10px] text-muted-foreground">{t('map.fromYou')}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
