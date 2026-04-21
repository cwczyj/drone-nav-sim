import math
from path_planning.geo_utils import (
    haversine_distance,
    spherical_polygon_area,
    calculate_bearing,
    sqm_to_mu,
    YOUYU_REGION,
)


class TestHaversineDistance:
    def test_long_distance(self):
        distance = haversine_distance(39.9042, 116.4074, 31.2304, 121.4737)
        assert math.isclose(distance, 1068000, rel_tol=0.01)

    def test_identical_points(self):
        distance = haversine_distance(40.0, 112.4, 40.0, 112.4)
        assert distance == 0

    def test_short_distance(self):
        distance = haversine_distance(40.0, 112.4, 40.0009, 112.4)
        assert math.isclose(distance, 100, rel_tol=0.01)


class TestSphericalPolygonArea:
    def test_square_area(self):
        coords = [
            (40.0, 112.4),
            (40.009, 112.4),
            (40.009, 112.409),
            (40.0, 112.409),
        ]
        area = spherical_polygon_area(coords)
        assert math.isclose(area, 1000000, rel_tol=0.01)

    def test_invalid_polygon(self):
        area = spherical_polygon_area([(40.0, 112.4)])
        assert area == 0


class TestCalculateBearing:
    def test_north_bearing(self):
        bearing = calculate_bearing(40.0, 112.4, 40.01, 112.4)
        assert math.isclose(bearing, 0, abs_tol=1)

    def test_east_bearing(self):
        bearing = calculate_bearing(40.0, 112.4, 40.0, 112.41)
        assert math.isclose(bearing, 90, abs_tol=1)


class TestSqmToMu:
    def test_conversion(self):
        assert math.isclose(sqm_to_mu(666.67), 1, rel_tol=0.01)
        assert math.isclose(sqm_to_mu(6666.7), 10, rel_tol=0.01)


class TestYouyuRegion:
    def test_center(self):
        assert YOUYU_REGION["center"] == (40.0, 112.4)

    def test_bounds(self):
        assert YOUYU_REGION["bounds"]["min_lat"] == 39.95
        assert YOUYU_REGION["bounds"]["max_lat"] == 40.05
        assert YOUYU_REGION["bounds"]["min_lon"] == 112.35
        assert YOUYU_REGION["bounds"]["max_lon"] == 112.45
