import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Dog } from '@/data/dogs';
import { DEFAULT_CENTER, locationToCoords } from '@/data/locations';
import { MapPin } from 'lucide-react';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const dogIcon = L.divIcon({
  html: `<div style="background:hsl(24 80% 55%);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:18px;">🐶</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const currentDogIcon = L.divIcon({
  html: `<div style="background:hsl(340 60% 60%);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.5);font-size:22px;">⭐</div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const userIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:4px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDog: Dog | null;
  allDogs: Dog[];
}

export function MapSheet({ open, onOpenChange, currentDog, allDogs }: MapSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  // Geolocation
  useEffect(() => {
    if (!open || userLocation) return;
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [open, userLocation]);

  // Initialize / update map
  useEffect(() => {
    if (!open || !containerRef.current) return;

    // Slight delay to ensure container has dimensions inside Sheet
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const currentCoords = currentDog ? locationToCoords(currentDog.location) : null;
      const center = userLocation ?? currentCoords ?? DEFAULT_CENTER;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center,
          zoom: 12,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Clear existing markers
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
      });

      const points: L.LatLngTuple[] = [];

      if (userLocation) {
        L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('📍 შენ აქ ხარ');
        points.push(userLocation);
      }

      if (currentCoords && currentDog) {
        L.marker(currentCoords, { icon: currentDogIcon })
          .addTo(map)
          .bindPopup(`<b>⭐ ${currentDog.name}</b><br/>${currentDog.location}`);
        points.push(currentCoords);
      }

      allDogs
        .filter(d => d.id !== currentDog?.id)
        .forEach(dog => {
          const coords = locationToCoords(dog.location);
          L.marker(coords, { icon: dogIcon })
            .addTo(map)
            .bindPopup(`<b>${dog.name}</b><br/>${dog.breed}<br/>${dog.location}`);
          points.push(coords);
        });

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
      } else if (points.length === 1) {
        map.setView(points[0], 13);
      }

      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [open, currentDog, allDogs, userLocation]);

  // Cleanup on close
  useEffect(() => {
    if (!open && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 glass-strong border-t border-border">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-primary-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            ძაღლები რუკაზე
            {locating && (
              <span className="text-xs text-primary-foreground/60 ml-auto">
                მდებარეობის ძებნა...
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div ref={containerRef} className="h-[calc(85vh-80px)] w-full" />
      </SheetContent>
    </Sheet>
  );
}
