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

export function formatDistance(km: number, unit: { meters: string; km: string } = { meters: 'მ', km: 'კმ' }): string {
  if (km < 1) return `${Math.round(km * 1000)} ${unit.meters}`;
  if (km < 10) return `${km.toFixed(1)} ${unit.km}`;
  return `${Math.round(km)} ${unit.km}`;
}
