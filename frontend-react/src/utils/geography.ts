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

  const R = 6371000; // 地球半径（米）
  const rad = Math.PI / 180;

  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = coords[i].latitude * rad;
    const lon1 = coords[i].longitude * rad;
    const lat2 = coords[j].latitude * rad;
    const lon2 = coords[j].longitude * rad;

    area += lon1 * lat2 - lon2 * lat1;
  }

  area = Math.abs(area * R * R / 2);
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
