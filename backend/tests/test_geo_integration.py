import pytest
import math
from path_planning.geo_utils import haversine_distance, spherical_polygon_area


class TestGeoIntegration:
    def test_haversine_accuracy(self):
        distance = haversine_distance(40.0, 112.4, 40.009, 112.4)
        assert 900 < distance < 1100

    def test_geo_area_calculation(self):
        coords = [
            (40.0, 112.4),
            (40.009, 112.4),
            (40.009, 112.409),
            (40.0, 112.409),
        ]
        area_sqm = spherical_polygon_area(coords)
        assert 800000 < area_sqm < 1200000

    def test_youyu_region_center(self):
        from path_planning.geo_utils import YOUYU_REGION
        assert YOUYU_REGION["center"] == (40.0, 112.4)
