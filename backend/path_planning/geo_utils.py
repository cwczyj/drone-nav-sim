import math
from typing import List, Tuple

EARTH_RADIUS_METERS = 6371000
SQ_METER_TO_MU = 666.67


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    to_rad = lambda d: d * math.pi / 180

    dlat = to_rad(lat2 - lat1)
    dlon = to_rad(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + \
        math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(dlon / 2) ** 2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_METERS * c


def spherical_polygon_area(coords: List[Tuple[float, float]]) -> float:
    """
    计算球面多边形面积（使用 Girard 公式的简化形式）
    
    Args:
        coords: 坐标列表 [(lat, lon), ...]，纬度在前
    
    Returns:
        面积（平方米）
    """
    if len(coords) < 3:
        return 0

    R = EARTH_RADIUS_METERS
    rad = math.pi / 180

    area = 0
    n = len(coords)

    for i in range(n):
        j = (i + 1) % n
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[j]

        # 正确公式: (lon2 - lon1) * (sin(lat1) + sin(lat2))
        area += (lon2 - lon1) * rad * (math.sin(lat1 * rad) + math.sin(lat2 * rad))

    area = abs(area) * R * R / 2
    return area


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    to_rad = lambda d: d * math.pi / 180
    to_deg = lambda r: r * 180 / math.pi

    dlon = to_rad(lon2 - lon1)
    y = math.sin(dlon) * math.cos(to_rad(lat2))
    x = math.cos(to_rad(lat1)) * math.sin(to_rad(lat2)) - \
        math.sin(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.cos(dlon)

    bearing = to_deg(math.atan2(y, x))
    return (bearing + 360) % 360


def sqm_to_mu(sqm: float) -> float:
    return sqm / SQ_METER_TO_MU


def latlon_to_local(coords: List[Tuple[float, float]], origin_lat: float, origin_lon: float) -> List[Tuple[float, float]]:
    """Convert geographic coordinates to local meter coordinates
    
    Args:
        coords: List of (lat, lon) coordinates
        origin_lat: Reference latitude (center point)
        origin_lon: Reference longitude (center point)
    
    Returns:
        List of (x, y) coordinates in meters from origin
    """
    rad = math.pi / 180
    meter_per_lat = 111000  # meters per degree latitude
    meter_per_lon = 111000 * math.cos(origin_lat * rad)  # meters per degree longitude at this latitude
    
    local_coords = []
    for lat, lon in coords:
        x = (lon - origin_lon) * meter_per_lon  # x = east-west distance in meters
        y = (lat - origin_lat) * meter_per_lat  # y = north-south distance in meters
        local_coords.append((x, y))
    
    return local_coords


def local_to_latlon(coords: List[Tuple[float, float]], origin_lat: float, origin_lon: float) -> List[Tuple[float, float]]:
    """Convert local meter coordinates back to geographic coordinates
    
    Args:
        coords: List of (x, y) coordinates in meters
        origin_lat: Reference latitude (center point)
        origin_lon: Reference longitude (center point)
    
    Returns:
        List of (lat, lon) coordinates
    """
    rad = math.pi / 180
    meter_per_lat = 111000
    meter_per_lon = 111000 * math.cos(origin_lat * rad)
    
    geo_coords = []
    for x, y in coords:
        lon = origin_lon + x / meter_per_lon
        lat = origin_lat + y / meter_per_lat
        geo_coords.append((lat, lon))
    
    return geo_coords


def get_center_coord(coords: List[Tuple[float, float]]) -> Tuple[float, float]:
    """Calculate the center point of a list of coordinates"""
    if not coords:
        return (0.0, 0.0)
    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lon = sum(c[1] for c in coords) / len(coords)
    return (avg_lat, avg_lon)


YOUYU_REGION = {
    "center": (40.0, 112.4),
    "bounds": {
        "min_lat": 39.95,
        "max_lat": 40.05,
        "min_lon": 112.35,
        "max_lon": 112.45,
    },
}
