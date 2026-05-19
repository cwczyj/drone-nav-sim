/**
 * 地理坐标计算工具
 *
 * 提供 Haversine 距离计算、球面面积计算等功能
 */

import type { GeoCoordinate } from '../types';

/**
 * 计算两点之间的球面距离（Haversine 公式）
 * @param lat1 点1纬度
 * @param lon1 点1经度
 * @param lat2 点2纬度
 * @param lon2 点2经度
 * @returns 距离（米）
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // 地球半径（米）
  const toRad = (deg: number) => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 计算地理多边形面积（球面面积）
 * @param coords 多边形顶点坐标
 * @returns 面积（平方米）
 */
export function sphericalPolygonArea(coords: GeoCoordinate[]): number {
  if (coords.length < 3) return 0;

  const R = 6371000;
  const rad = Math.PI / 180;

  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = coords[i].latitude * rad;
    const lon1 = coords[i].longitude * rad;
    const lat2 = coords[j].latitude * rad;
    const lon2 = coords[j].longitude * rad;

    area += (lon2 - lon1) * (Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area) * R * R / 2;
  return area;
}

/**
 * 计算方位角（bearing）
 * @param lat1 起点纬度
 * @param lon1 起点经度
 * @param lat2 终点纬度
 * @param lon2 终点经度
 * @returns 方位角（度，0-360）
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * 将面积从平方米转换为亩
 * @param sqm 平方米
 * @returns 亩
 */
export function sqmToMu(sqm: number): number {
  return sqm / 666.67;
}

export function calculateGeographicAreaMu(coords: [number, number][]): number {
  if (coords.length < 3) return 0;
  const geoCoords: GeoCoordinate[] = coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
  const areaSqM = sphericalPolygonArea(geoCoords);
  return sqmToMu(areaSqM);
}

export function formatArea(area: number): string {
  if (area === 0) return '0 亩';
  return `${area.toFixed(2)} 亩`;
}

/**
 * 山西右玉默认区域参数
 */
export const YOUYU_REGION = {
  center: { latitude: 40.0, longitude: 112.4 },
  bounds: {
    minLat: 39.95,
    maxLat: 40.05,
    minLng: 112.35,
    maxLng: 112.45,
  },
};

export function calculateBoundsFromCoords(coords: [number, number][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (coords.length === 0) {
    return YOUYU_REGION.bounds;
  }
  
  const lngs = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  
  const lngRange = Math.max(...lngs) - Math.min(...lngs);
  const latRange = Math.max(...lats) - Math.min(...lats);
  const lngPadding = Math.max(lngRange * 0.2, 0.002);
  const latPadding = Math.max(latRange * 0.2, 0.002);
  
  return {
    minLng: Math.min(...lngs) - lngPadding,
    maxLng: Math.max(...lngs) + lngPadding,
    minLat: Math.min(...lats) - latPadding,
    maxLat: Math.max(...lats) + latPadding,
  };
}

export function calculateBoundsFromMultiplePolygons(polygons: [number, number][][]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const allCoords = polygons.flat();
  return calculateBoundsFromCoords(allCoords);
}
