import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Dog } from '@/data/dogs';
import { DEFAULT_CENTER, locationToCoords } from '@/data/locations';
import { MapPin, Navigation } from 'lucide-react';

// Fix default marker icons in Leaflet with bundlers
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
  html: `<div style="background:hsl(340 60% 60%);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.5);font-size:22px;animation:pulse 2s infinite;">⭐</div>`,
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

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

interface MapSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDog: Dog | null;
  allDogs: Dog[];
}

export function MapSheet({ open, onOpenChange, currentDog, allDogs }: MapSheetProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

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

  const currentCoords = currentDog ? locationToCoords(currentDog.location) : null;
  const otherDogs = allDogs.filter(d => d.id !== currentDog?.id);

  const allPoints: [number, number][] = [
    ...(userLocation ? [userLocation] : []),
    ...(currentCoords ? [currentCoords] : []),
    ...otherDogs.map(d => locationToCoords(d.location)),
  ];

  const center = userLocation ?? currentCoords ?? DEFAULT_CENTER;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] p-0 glass-strong border-t border-border">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-primary-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            ძაღლები რუკაზე
            {locating && <span className="text-xs text-primary-foreground/60 ml-auto">მდებარეობის ძებნა...</span>}
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(85vh-80px)] w-full overflow-hidden">
          {open && (
            <MapContainer
              center={center}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
              />
              <FitBounds points={allPoints} />

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="flex items-center gap-1 font-medium">
                      <Navigation className="h-3 w-3" /> შენ აქ ხარ
                    </div>
                  </Popup>
                </Marker>
              )}

              {currentCoords && currentDog && (
                <Marker position={currentCoords} icon={currentDogIcon}>
                  <Popup>
                    <div className="font-semibold">⭐ {currentDog.name}</div>
                    <div className="text-xs">{currentDog.location}</div>
                  </Popup>
                </Marker>
              )}

              {otherDogs.map(dog => (
                <Marker key={dog.id} position={locationToCoords(dog.location)} icon={dogIcon}>
                  <Popup>
                    <div className="font-semibold">{dog.name}</div>
                    <div className="text-xs">{dog.breed}</div>
                    <div className="text-xs text-gray-600">{dog.location}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
