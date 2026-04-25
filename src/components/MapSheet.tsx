import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Dog } from '@/data/dogs';
import { DEFAULT_CENTER, getDogCoords } from '@/data/locations';
import { MapPin } from 'lucide-react';

interface MapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDog: Dog | null;
  allDogs: Dog[];
  onSelectDog?: (dog: Dog) => void;
}

const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
  className: 'user-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const dotIcon = (isCurrent: boolean) => {
  const color = isCurrent ? 'hsl(36, 89%, 54%)' : 'hsl(283, 49%, 53%)';
  const size = isCurrent ? 22 : 16;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;"></div>`,
    className: 'pet-dot',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function MapSheet({ open, onOpenChange, currentDog, allDogs, onSelectDog }: MapSheetProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

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

  // Init map via callback ref — only fires when the DOM node actually mounts
  const setContainer = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        userMarkerRef.current = null;
      }
      return;
    }
    if (mapRef.current) return;

    const map = L.map(node, {
      center: DEFAULT_CENTER,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Animation may not be done yet; force size recalc shortly
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);
  }, []);

  // Sync dog markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existingIds = new Set(markersRef.current.keys());
    const seen = new Set<string>();

    allDogs.forEach(dog => {
      const [lat, lng] = getDogCoords(dog);
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;
      const isCurrent = currentDog?.id === dog.id;
      seen.add(dog.id);

      const existing = markersRef.current.get(dog.id);
      if (existing) {
        existing.setLatLng([lat, lng]);
        existing.setIcon(dotIcon(isCurrent));
      } else {
        const m = L.marker([lat, lng], {
          icon: dotIcon(isCurrent),
          zIndexOffset: isCurrent ? 500 : 0,
        }).addTo(map);
        m.bindTooltip(dog.name, { direction: 'top', offset: [0, -8], opacity: 0.95 });
        m.on('click', () => onSelectDog?.(dog));
        markersRef.current.set(dog.id, m);
      }
    });

    // Remove markers no longer in allDogs
    existingIds.forEach(id => {
      if (!seen.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });
  }, [allDogs, currentDog, onSelectDog]);

  // Sync user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLocation);
    } else {
      userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 2000 })
        .addTo(map)
        .bindTooltip('თქვენ', { direction: 'top', offset: [0, -10] });
    }
  }, [userLocation]);

  // Fit bounds to all points when sheet opens
  useEffect(() => {
    if (!open) return;
    const map = mapRef.current;
    if (!map) return;
    const points: L.LatLngTuple[] = [
      ...allDogs
        .map(d => getDogCoords(d))
        .filter(([la, ln]) => typeof la === 'number' && !isNaN(la) && typeof ln === 'number' && !isNaN(ln)) as L.LatLngTuple[],
      ...(userLocation ? [userLocation as L.LatLngTuple] : []),
    ];
    if (points.length === 0) return;
    setTimeout(() => {
      if (points.length === 1) {
        map.setView(points[0], 14);
      } else {
        map.fitBounds(L.latLngBounds(points).pad(0.15), { animate: false, maxZoom: 15 });
      }
      map.invalidateSize();
    }, 450);
  }, [open, allDogs.length, userLocation]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 glass-strong border-t border-border flex flex-col">
        <SheetHeader className="p-4 pb-2 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            ცხოველები რუკაზე ({allDogs.length})
            {locating && (
              <span className="text-xs text-muted-foreground ml-auto">
                მდებარეობის ძებნა...
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 relative overflow-hidden bg-secondary">
          {open && <div ref={setContainer} className="absolute inset-0 z-0" />}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] glass rounded-xl px-3 py-2 text-xs space-y-1">
            <div className="flex items-center gap-2 text-foreground">
              <div className="h-3 w-3 rounded-full bg-primary border-2 border-white" />
              მიმდინარე
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <div className="h-2.5 w-2.5 rounded-full bg-accent border-2 border-white" />
              დანარჩენი
            </div>
            {userLocation && (
              <div className="flex items-center gap-2 text-foreground">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-white" />
                შენ
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
