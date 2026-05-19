import { haversineDistance, sphericalPolygonArea, calculateBearing, sqmToMu } from './geography';

describe('haversineDistance', () => {
  it('should calculate distance between two points correctly', () => {
    // 北京到上海的距离约 1068km
    const distance = haversineDistance(39.9042, 116.4074, 31.2304, 121.4737);
    expect(distance).toBeCloseTo(1068000, -4);
  });

  it('should return 0 for identical points', () => {
    const distance = haversineDistance(40.0, 112.4, 40.0, 112.4);
    expect(distance).toBe(0);
  });

  it('should calculate short distance correctly', () => {
    // 山西右玉区域内 100m 测试
    const distance = haversineDistance(40.0, 112.4, 40.0009, 112.4);
    expect(distance).toBeCloseTo(100, 0);
  });
});

describe('sphericalPolygonArea', () => {
  it('should calculate area for a simple polygon', () => {
    const coords = [
      { latitude: 40.0, longitude: 112.4 },
      { latitude: 40.009, longitude: 112.4 },
      { latitude: 40.009, longitude: 112.409 },
      { latitude: 40.0, longitude: 112.409 },
    ];
    const area = sphericalPolygonArea(coords);
    expect(area).toBeCloseTo(767000, -4);
  });

  it('should return 0 for invalid polygon', () => {
    const area = sphericalPolygonArea([{ latitude: 40.0, longitude: 112.4 }]);
    expect(area).toBe(0);
  });
});

describe('calculateBearing', () => {
  it('should calculate north bearing as 0', () => {
    const bearing = calculateBearing(40.0, 112.4, 40.01, 112.4);
    expect(bearing).toBeCloseTo(0, 0);
  });

  it('should calculate east bearing as 90', () => {
    const bearing = calculateBearing(40.0, 112.4, 40.0, 112.41);
    expect(bearing).toBeCloseTo(90, 0);
  });
});

describe('sqmToMu', () => {
  it('should convert sqm to mu correctly', () => {
    expect(sqmToMu(666.67)).toBeCloseTo(1, 2);
    expect(sqmToMu(6666.7)).toBeCloseTo(10, 2);
  });
});
