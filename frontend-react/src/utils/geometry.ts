/**
 * Polygon area calculation using shoelace formula
 * @param coords - Array of [x, y] coordinates representing polygon vertices
 * @param coordToMeter - Conversion factor from coordinate units to meters (default: 1.0)
 * @param sqmToMu - Conversion factor from square meters to 亩 (default: 666.67)
 * @returns Area in 亩
 */
export function calculatePolygonArea(
  coords: [number, number][],
  coordToMeter: number = 1.0,
  sqmToMu: number = 666.67
): number {
  if (coords.length < 3) {
    return 0;
  }

  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }

  // Shoelace formula: Area = 0.5 * |sum|
  const areaSqMeters = (Math.abs(area) / 2) * coordToMeter * coordToMeter;

  const areaMu = areaSqMeters / sqmToMu;

  return Math.round(areaMu * 100) / 100;
}

/**
 * Format area value for display
 * @param area - Area in 亩
 * @returns Formatted string with unit
 */
export function formatArea(area: number): string {
  if (area === 0) {
    return '0 亩';
  }
  return `${area.toFixed(2)} 亩`;
}