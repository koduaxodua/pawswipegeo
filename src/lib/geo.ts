/**
 * Haversine distance between two lat/lng points in kilometres.
 */
export function haversineKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const PUBLIC_LOCATION_JITTER_MIN_METERS = 300;
export const PUBLIC_LOCATION_JITTER_MAX_METERS = 700;

export function jitterCoordinates(
  lat: number,
  lng: number,
  random: () => number = Math.random
): { lat: number; lng: number } {
  const radiusMeters =
    PUBLIC_LOCATION_JITTER_MIN_METERS
    + random() * (PUBLIC_LOCATION_JITTER_MAX_METERS - PUBLIC_LOCATION_JITTER_MIN_METERS);
  const angle = random() * 2 * Math.PI;
  const metersPerDegree = 111_320;
  const latOffset = (radiusMeters * Math.cos(angle)) / metersPerDegree;
  const lngOffset =
    (radiusMeters * Math.sin(angle))
    / (metersPerDegree * Math.max(Math.cos((lat * Math.PI) / 180), 0.0001));

  return {
    lat: Number((lat + latOffset).toFixed(6)),
    lng: Number((lng + lngOffset).toFixed(6)),
  };
}

export function formatDistance(km: number, unit: { meters: string; km: string } = { meters: 'მ', km: 'კმ' }): string {
  if (km < 1) return `${Math.round(km * 1000)} ${unit.meters}`;
  if (km < 10) return `${km.toFixed(1)} ${unit.km}`;
  return `${Math.round(km)} ${unit.km}`;
}
