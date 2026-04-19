// Approximate coordinates for Tbilisi neighborhoods used in dog locations
export const TBILISI_DISTRICTS: Record<string, [number, number]> = {
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

export const DEFAULT_CENTER: [number, number] = [41.7151, 44.8271]; // Tbilisi

export function locationToCoords(location: string): [number, number] {
  // location format: "ვაკე, თბილისი" — extract first part
  const district = location.split(',')[0].trim();
  return TBILISI_DISTRICTS[district] ?? DEFAULT_CENTER;
}
