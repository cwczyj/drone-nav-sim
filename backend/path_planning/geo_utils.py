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
    if len(coords) < 3:
        return 0

    rad = math.pi / 180

    area = 0
    n = len(coords)

    for i in range(n):
        j = (i + 1) % n
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[j]

        area += lon1 * rad * lat2 * rad - lon2 * rad * lat1 * rad

    area = abs(area * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS / 2)
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


YOUYU_REGION = {
    "center": (40.0, 112.4),
    "bounds": {
        "min_lat": 39.95,
        "max_lat": 40.05,
        "min_lon": 112.35,
        "max_lon": 112.45,
    },
}
