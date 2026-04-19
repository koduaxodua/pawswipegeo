import { useEffect, useState } from 'react';
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

export function MapSheet({ open, onOpenChange, currentDog, allDogs }: MapSheetProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [selected, setSelected] = useState<Dog | null>(null);

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

  useEffect(() => {
    if (open && currentDog) setSelected(currentDog);
  }, [open, currentDog]);

  // Determine map focus point: selected dog > current dog > user > default
  const focusCoords: [number, number] = selected
    ? getDogCoords(selected)
    : currentDog
    ? getDogCoords(currentDog)
    : userLocation ?? DEFAULT_CENTER;

  const [lat, lng] = focusCoords;

  // OpenStreetMap embed via iframe — no API key required, reliable tile loading
  // bbox: roughly ±0.05° around the focus point (covers most of Tbilisi when zoomed)
  const bboxDelta = 0.05;
  const bbox = `${lng - bboxDelta},${lat - bboxDelta},${lng + bboxDelta},${lat + bboxDelta}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  // Build Google Maps "Directions" link from user → focus point
  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 glass-strong border-t border-border flex flex-col">
        <SheetHeader className="p-4 pb-2 flex-shrink-0">
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

        {/* Map iframe (OpenStreetMap embed) */}
        <div className="flex-1 relative overflow-hidden bg-secondary">
          <iframe
            key={`${lat}-${lng}`}
            title="რუკა"
            src={osmUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:opacity-90 transition"
          >
            <Navigation className="h-3.5 w-3.5" />
            Google Maps-ში გახსნა
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Dog list — tap to focus on the map */}
        <div className="flex-shrink-0 max-h-[35%] overflow-y-auto border-t border-border/50 bg-background/80 backdrop-blur">
          <div className="p-3 space-y-2">
            {userLocation && (
              <div className="flex items-center gap-2 text-xs text-primary-foreground/60 px-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                შენი მდებარეობა: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </div>
            )}
            {allDogs.map(dog => {
              const isSelected = selected?.id === dog.id;
              const isCurrent = currentDog?.id === dog.id;
              const [dLat, dLng] = getDogCoords(dog);
              return (
                <button
                  key={dog.id}
                  onClick={() => setSelected(dog)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-primary/20 border border-primary/40'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <img
                    src={dog.photo}
                    alt={dog.name}
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-primary-foreground truncate">
                        {isCurrent && '⭐ '}{dog.name}
                      </span>
                    </div>
                    <div className="text-xs text-primary-foreground/60 truncate">
                      {dog.location}
                    </div>
                    <div className="text-[10px] text-primary-foreground/40 font-mono">
                      {dLat.toFixed(4)}, {dLng.toFixed(4)}
                    </div>
                  </div>
                  <MapPin className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-primary-foreground/40'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
