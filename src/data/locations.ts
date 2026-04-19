// Tbilisi center fallback
export const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271];

// Approximate coordinates for Tbilisi neighborhoods — used as fallback
// when a dog has no explicit lat/lng.
const TBILISI_DISTRICTS: Record<string, [number, number]> = {
  'ვაკე': [41.7099, 44.7641],
  'საბურთალო': [41.7250, 44.7400],
  'დიდუბე': [41.7470, 44.7900],
  'ისანი': [41.6850, 44.8250],
  'გლდანი': [41.7800, 44.8150],
  'ნაძალადევი': [41.7600, 44.8000],
  'ვარკეთილი': [41.6700, 44.8700],
  'ძველი თბილისი': [41.6900, 44.8050],
  'ჩუღურეთი': [41.7300, 44.8000],
  'მთაწმინდა': [41.6950, 44.7900],
};

export function locationToCoords(location: string): [number, number] {
  const district = location.split(',')[0].trim();
  for (const key of Object.keys(TBILISI_DISTRICTS)) {
    if (district.includes(key)) return TBILISI_DISTRICTS[key];
  }
  return DEFAULT_CENTER;
}

/**
 * Parse coordinates from various sources:
 * - Google Maps URLs: https://www.google.com/maps/@41.7099,44.7641,15z
 *                     https://www.google.com/maps/place/.../@41.7099,44.7641,17z
 *                     https://maps.app.goo.gl/... (already redirected)
 * - Plain "lat, lng" string: "41.7099, 44.7641"
 * - "lat,lng" without space: "41.7099,44.7641"
 */
export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Google Maps @lat,lng pattern
  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // Google Maps "?q=lat,lng" or "&q=lat,lng"
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // Google Maps "/place/lat,lng" or "ll=lat,lng"
  const llMatch = trimmed.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) {
    return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
  }

  // Plain "lat, lng" string
  const plain = trimmed.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (plain) {
    return { lat: parseFloat(plain[1]), lng: parseFloat(plain[2]) };
  }

  return null;
}

export function getDogCoords(dog: { lat?: number; lng?: number; location: string }): [number, number] {
  if (typeof dog.lat === 'number' && typeof dog.lng === 'number') {
    return [dog.lat, dog.lng];
  }
  return locationToCoords(dog.location);
}
