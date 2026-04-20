import { useEffect, useRef, useState } from 'react';
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
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [wrapSize, setWrapSize] = useState({ w: 0, h: 0 });

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

  // Track map container size for overlay marker positioning
  useEffect(() => {
    if (!open || !mapWrapRef.current) return;
    const el = mapWrapRef.current;
    const update = () => setWrapSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Compute bbox that covers all dogs + user (when present)
  const allPoints: [number, number][] = [
    ...allDogs.map(getDogCoords),
    ...(userLocation ? [userLocation] : []),
  ];
  const focusCoords: [number, number] = selected
    ? getDogCoords(selected)
    : currentDog
    ? getDogCoords(currentDog)
    : userLocation ?? DEFAULT_CENTER;

  // bbox: if a dog selected → tight zoom; else fit all points with padding
  let minLat: number, maxLat: number, minLng: number, maxLng: number;
  if (selected) {
    const [la, ln] = focusCoords;
    const d = 0.015;
    minLat = la - d; maxLat = la + d; minLng = ln - d; maxLng = ln + d;
  } else if (allPoints.length > 0) {
    const lats = allPoints.map(p => p[0]);
    const lngs = allPoints.map(p => p[1]);
    minLat = Math.min(...lats); maxLat = Math.max(...lats);
    minLng = Math.min(...lngs); maxLng = Math.max(...lngs);
    // Pad bbox by 15% on each side so markers aren't on the edge
    const padLat = Math.max((maxLat - minLat) * 0.15, 0.005);
    const padLng = Math.max((maxLng - minLng) * 0.15, 0.005);
    minLat -= padLat; maxLat += padLat;
    minLng -= padLng; maxLng += padLng;
  } else {
    const [la, ln] = DEFAULT_CENTER;
    const d = 0.05;
    minLat = la - d; maxLat = la + d; minLng = ln - d; maxLng = ln + d;
  }

  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
  const [fLat, fLng] = focusCoords;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  // Convert lat/lng → pixel position within wrapper (linear projection — fine at city scale)
  const project = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * wrapSize.w;
    const y = ((maxLat - lat) / (maxLat - minLat)) * wrapSize.h;
    return { x, y };
  };

  const directionsUrl = userLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${fLat},${fLng}`
    : `https://www.google.com/maps/search/?api=1&query=${fLat},${fLng}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] p-0 glass-strong border-t border-border flex flex-col">
        <SheetHeader className="p-4 pb-2 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-primary-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            ძაღლები რუკაზე ({allDogs.length})
            {locating && (
              <span className="text-xs text-primary-foreground/60 ml-auto">
                მდებარეობის ძებნა...
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Map iframe + overlay markers for ALL dogs */}
        <div ref={mapWrapRef} className="flex-1 relative overflow-hidden bg-secondary">
          <iframe
            key={bbox}
            title="რუკა"
            src={osmUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Marker overlay — positioned absolute over the map */}
          {wrapSize.w > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* User location dot */}
              {userLocation && (() => {
                const { x, y } = project(userLocation[0], userLocation[1]);
                if (x < 0 || y < 0 || x > wrapSize.w || y > wrapSize.h) return null;
                return (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x, top: y }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-500/40 animate-ping" />
                      <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
                    </div>
                  </div>
                );
              })()}

              {/* Dog markers */}
              {allDogs.map(dog => {
                const [dLat, dLng] = getDogCoords(dog);
                const { x, y } = project(dLat, dLng);
                if (x < -20 || y < -20 || x > wrapSize.w + 20 || y > wrapSize.h + 20) return null;
                const isSelected = selected?.id === dog.id;
                const isCurrent = currentDog?.id === dog.id;
                return (
                  <button
                    key={dog.id}
                    onClick={() => setSelected(dog)}
                    className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto group"
                    style={{ left: x, top: y, zIndex: isSelected ? 30 : isCurrent ? 20 : 10 }}
                  >
                    <div
                      className={`relative flex flex-col items-center transition-transform ${
                        isSelected ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    >
                      <div
                        className={`rounded-full overflow-hidden border-2 shadow-lg ${
                          isSelected
                            ? 'border-primary h-12 w-12'
                            : isCurrent
                            ? 'border-yellow-400 h-10 w-10'
                            : 'border-white h-9 w-9'
                        }`}
                      >
                        <img src={dog.photo} alt={dog.name} className="h-full w-full object-cover" />
                      </div>
                      <div
                        className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${
                          isSelected
                            ? 'border-t-primary'
                            : isCurrent
                            ? 'border-t-yellow-400'
                            : 'border-t-white'
                        } -mt-0.5`}
                      />
                      {isSelected && (
                        <div className="absolute top-full mt-1 whitespace-nowrap bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full shadow">
                          {dog.name}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-40 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:opacity-90 transition"
          >
            <Navigation className="h-3.5 w-3.5" />
            Google Maps-ში გახსნა
            <ExternalLink className="h-3 w-3" />
          </a>

          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 left-3 z-40 bg-background/80 backdrop-blur text-primary-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-background transition"
            >
              ← ყველა ძაღლის ნახვა
            </button>
          )}
        </div>

        {/* Dog list */}
        <div className="flex-shrink-0 max-h-[30%] overflow-y-auto border-t border-border/50 bg-background/80 backdrop-blur">
          <div className="p-3 space-y-2">
            {allDogs.map(dog => {
              const isSelected = selected?.id === dog.id;
              const isCurrent = currentDog?.id === dog.id;
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
                    <div className="font-medium text-sm text-primary-foreground truncate">
                      {isCurrent && '⭐ '}{dog.name}
                    </div>
                    <div className="text-xs text-primary-foreground/60 truncate">
                      {dog.location}
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
