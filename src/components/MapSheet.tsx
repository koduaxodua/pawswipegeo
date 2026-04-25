import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Dog } from '@/data/dogs';
import { DEFAULT_CENTER, getDogCoords } from '@/data/locations';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDog: Dog | null;
  allDogs: Dog[];
}

const buildAvatarIcon = (photo: string, isSelected: boolean, isCurrent: boolean) => {
  const ring = isSelected
    ? 'border-color:hsl(36 89% 54%);width:56px;height:56px'
    : isCurrent
    ? 'border-color:#facc15;width:46px;height:46px'
    : 'border-color:#fff;width:42px;height:42px';
  const html = `
    <div style="${ring};border-width:3px;border-style:solid;border-radius:9999px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.4);background:#000;">
      <img src="${photo}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="" />
    </div>`;
  return L.divIcon({
    html,
    className: 'pet-marker',
    iconSize: [isSelected ? 56 : isCurrent ? 46 : 42, isSelected ? 56 : isCurrent ? 46 : 42],
    iconAnchor: [isSelected ? 28 : isCurrent ? 23 : 21, isSelected ? 28 : isCurrent ? 23 : 21],
  });
};

const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
  className: 'user-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function MapSheet({ open, onOpenChange, currentDog, allDogs }: MapSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState<Dog | null>(null);

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

  // Initialize map when sheet opens
  useEffect(() => {
    if (!open || !containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: currentDog ? getDogCoords(currentDog) : DEFAULT_CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;

    // Force size recalc after sheet animation
    setTimeout(() => map.invalidateSize(), 350);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      userMarkerRef.current = null;
    };
  }, [open]);

  // Sync dog markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const next = new Map<string, L.Marker>();
    allDogs.forEach(dog => {
      const [lat, lng] = getDogCoords(dog);
      const isSelected = selected?.id === dog.id;
      const isCurrent = currentDog?.id === dog.id && !selected;
      const icon = buildAvatarIcon(dog.photo, isSelected, isCurrent);

      const existing = markersRef.current.get(dog.id);
      if (existing) {
        existing.setLatLng([lat, lng]);
        existing.setIcon(icon);
        next.set(dog.id, existing);
        markersRef.current.delete(dog.id);
      } else {
        const m = L.marker([lat, lng], { icon, zIndexOffset: isSelected ? 1000 : isCurrent ? 500 : 0 })
          .addTo(map)
          .on('click', () => setSelected(dog));
        m.bindTooltip(dog.name, { direction: 'top', offset: [0, -20], opacity: 0.95 });
        next.set(dog.id, m);
      }
    });

    // Remove stale markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = next;
  }, [allDogs, selected, currentDog]);

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

  // Fit bounds when sheet opens or selection clears
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selected) {
      map.flyTo(getDogCoords(selected), 15, { duration: 0.6 });
      return;
    }
    const points: L.LatLngTuple[] = [
      ...allDogs.map(d => getDogCoords(d) as L.LatLngTuple),
      ...(userLocation ? [userLocation as L.LatLngTuple] : []),
    ];
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points).pad(0.15), { animate: true, maxZoom: 15 });
    }
  }, [selected, allDogs.length, userLocation, open]);

  // Auto-select current dog when sheet opens
  useEffect(() => {
    if (open && currentDog && !selected) setSelected(currentDog);
  }, [open]);

  const targetDog = selected ?? currentDog;
  const directionsUrl = (() => {
    if (!targetDog) return '#';
    const [tLat, tLng] = getDogCoords(targetDog);
    const label = encodeURIComponent(`${targetDog.name} — ${targetDog.location}`);
    return userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${tLat},${tLng}&destination_place_id=${label}`
      : `https://www.google.com/maps/search/?api=1&query=${tLat},${tLng}&query_place_id=${label}`;
  })();

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
          <div ref={containerRef} className="absolute inset-0 z-0" />

          {targetDog && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:opacity-90 transition"
            >
              <Navigation className="h-3.5 w-3.5" />
              Google Maps-ში გახსნა
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 left-3 z-[1000] bg-background/80 backdrop-blur text-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-background transition"
            >
              ← ყველას ნახვა
            </button>
          )}
        </div>

        {/* Selected pet quick info */}
        {targetDog && (
          <div className="flex-shrink-0 border-t border-border/50 bg-background/80 backdrop-blur p-3">
            <div className="flex items-center gap-3">
              <img
                src={targetDog.photo}
                alt={targetDog.name}
                className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {targetDog.name}, {targetDog.age}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {targetDog.location}
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
