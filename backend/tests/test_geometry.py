"""
几何工具模块单元测试
"""

import pytest
from backend.path_planning.geometry import (
    calculate_polygon_area,
    point_in_polygon,
    polygons_overlap,
    polygon_centroid,
    polygon_bounds,
    simplify_polygon,
    offset_polygon,
    PolygonUtils,
)


class TestCalculatePolygonArea:
    """测试多边形面积计算"""

    def test_square_area(self):
        """测试正方形面积"""
        # 100x100的正方形 = 10000平方米 = 15.0亩
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        area = calculate_polygon_area(coords, coord_to_meter=1.0, sqm_to_mu=1.0/666.67)
        assert area == pytest.approx(15.0, rel=0.01)

    def test_triangle_area(self):
        """测试三角形面积"""
        # 底100，高100的三角形 = 5000平方米
        coords = [[100, 100], [200, 100], [150, 200], [100, 100]]
        area = calculate_polygon_area(coords, coord_to_meter=1.0, sqm_to_mu=1.0)
        assert area == pytest.approx(5000.0, rel=0.01)

    def test_less_than_3_points(self):
        """测试少于3个点的情况"""
        coords = [[100, 100], [200, 100]]
        area = calculate_polygon_area(coords)
        assert area == 0

    def test_trapezoid_area(self):
        """测试梯形面积"""
        # 梯形：上底100，下底200，高100 = (100+200)*100/2 = 15000平方米
        coords = [[150, 100], [250, 100], [300, 200], [100, 200], [150, 100]]
        area = calculate_polygon_area(coords, coord_to_meter=1.0, sqm_to_mu=1.0)
        assert area == pytest.approx(15000.0, rel=0.01)

    def test_without_closing_point(self):
        """测试不包含闭合点的情况"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200]]
        area = calculate_polygon_area(coords, coord_to_meter=1.0, sqm_to_mu=1.0)
        assert area == pytest.approx(10000.0, rel=0.01)


class TestPointInPolygon:
    """测试点在多边形内判断"""

    def test_point_inside_square(self):
        """测试点在正方形内"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        point = [150, 150]
        assert point_in_polygon(point, coords) is True

    def test_point_outside_square(self):
        """测试点在正方形外"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        point = [250, 250]
        assert point_in_polygon(point, coords) is False

    def test_point_on_edge(self):
        """测试点在边上"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        point = [150, 100]
        assert point_in_polygon(point, coords) is True

    def test_point_at_corner(self):
        """测试点在角上"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        point = [100, 100]
        assert point_in_polygon(point, coords) is True

    def test_point_inside_complex_polygon(self):
        """测试点在复杂多边形内"""
        coords = [[100, 100], [250, 100], [250, 200], [200, 200], [200, 150], [150, 150], [150, 200], [100, 200], [100, 100]]
        point = [175, 175]
        assert point_in_polygon(point, coords) is True


class TestPolygonsOverlap:
    """测试多边形重叠检测"""

    def test_overlapping_squares(self):
        """测试重叠的正方形"""
        poly1 = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        poly2 = [[150, 150], [250, 150], [250, 250], [150, 250], [150, 150]]
        assert polygons_overlap(poly1, poly2) is True

    def test_non_overlapping_squares(self):
        """测试不重叠的正方形"""
        poly1 = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        poly2 = [[300, 300], [400, 300], [400, 400], [300, 400], [300, 300]]
        assert polygons_overlap(poly1, poly2) is False

    def test_touching_squares(self):
        """测试相切的正方形"""
        poly1 = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        poly2 = [[200, 200], [300, 200], [300, 300], [200, 300], [200, 200]]
        # 由于线段相交检测，相切算作重叠
        assert polygons_overlap(poly1, poly2) is True

    def test_one_inside_another(self):
        """测试一个多边形在另一个内部"""
        poly1 = [[100, 100], [300, 100], [300, 300], [100, 300], [100, 100]]
        poly2 = [[150, 150], [250, 150], [250, 250], [150, 250], [150, 150]]
        assert polygons_overlap(poly1, poly2) is True


class TestPolygonCentroid:
    """测试多边形中心点计算"""

    def test_square_centroid(self):
        """测试正方形中心点"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200]]
        centroid = polygon_centroid(coords)
        assert centroid == pytest.approx((150.0, 150.0))

    def test_rectangle_centroid(self):
        """测试长方形中心点"""
        coords = [[100, 100], [300, 100], [300, 200], [100, 200]]
        centroid = polygon_centroid(coords)
        assert centroid == pytest.approx((200.0, 150.0))


class TestPolygonBounds:
    """测试多边形边界框计算"""

    def test_square_bounds(self):
        """测试正方形边界框"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200]]
        bounds = polygon_bounds(coords)
        assert bounds == (100.0, 100.0, 200.0, 200.0)

    def test_complex_polygon_bounds(self):
        """测试复杂多边形边界框"""
        coords = [[150, 100], [250, 120], [280, 180], [200, 220], [120, 180], [150, 100]]
        bounds = polygon_bounds(coords)
        assert bounds == (120.0, 100.0, 280.0, 220.0)


class TestSimplifyPolygon:
    """测试多边形简化"""

    def test_simplify_no_change(self):
        """测试简化不会改变简单多边形"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        simplified = simplify_polygon(coords, tolerance=0.1)
        # 简单正方形应该保持不变
        assert len(simplified) <= len(coords)

    def test_simplify_complex_polygon(self):
        """测试简化复杂多边形"""
        # 创建一个有很多点的多边形
        coords = [[100, 100], [150, 100], [200, 100], [250, 100], [300, 100],
                  [300, 150], [300, 200], [300, 250], [300, 300],
                  [250, 300], [200, 300], [150, 300], [100, 300],
                  [100, 250], [100, 200], [100, 150], [100, 100]]
        simplified = simplify_polygon(coords, tolerance=10.0)
        # 简化后点数应该减少
        assert len(simplified) < len(coords)


class TestOffsetPolygon:
    """测试多边形偏移"""

    def test_offset_outward(self):
        """测试向外偏移"""
        coords = [[100, 100], [200, 100], [200, 200], [100, 200], [100, 100]]
        offset = offset_polygon(coords, distance=10)
        # 向外偏移后，边界应该变大
        original_bounds = polygon_bounds(coords)
        offset_bounds = polygon_bounds(offset)
        assert offset_bounds[0] < original_bounds[0]  # min_x 减小
        assert offset_bounds[1] < original_bounds[1]  # min_y 减小
        assert offset_bounds[2] > original_bounds[2]  # max_x 增大
        assert offset_bounds[3] > original_bounds[3]  # max_y 增大

    def test_offset_inward(self):
        """测试向内偏移"""
        coords = [[100, 100], [300, 100], [300, 300], [100, 300], [100, 100]]
        offset = offset_polygon(coords, distance=-50)
        # 向内偏移后，边界应该变小
        original_bounds = polygon_bounds(coords)
        offset_bounds = polygon_bounds(offset)
        assert offset_bounds[0] > original_bounds[0]  # min_x 增大
        assert offset_bounds[1] > original_bounds[1]  # min_y 增大
        assert offset_bounds[2] < original_bounds[2]  # max_x 减小
        assert offset_bounds[3] < original_bounds[3]  # max_y 减小


class TestPolygonUtils:
    """测试PolygonUtils类"""

    def setup_method(self):
        """测试前准备"""
        from shapely.geometry import Polygon
        self.utils = PolygonUtils()
        self.square = Polygon([(100, 100), (200, 100), (200, 200), (100, 200)])

    def test_calculate_area(self):
        """测试面积计算"""
        area = self.utils.calculate_area(self.square)
        assert area == 10000.0

    def test_distance_to_polygon(self):
        """测试点到多边形距离"""
        from shapely.geometry import Point

        # 点在多边形内
        point_inside = Point(150, 150)
        distance = self.utils.distance_to_polygon(point_inside, self.square)
        assert distance == 0.0

        # 点在多边形外
        point_outside = Point(250, 250)
        distance = self.utils.distance_to_polygon(point_outside, self.square)
        assert distance > 0

    def test_get_bounding_box(self):
        """测试获取边界框"""
        bounds = self.utils.get_bounding_box(self.square)
        assert bounds == (100.0, 100.0, 200.0, 200.0)

    def test_polygon_to_grid(self):
        """测试多边形转网格点"""
        grid_size = 50
        grid_points = self.utils.polygon_to_grid(self.square, grid_size)

        # 检查点的数量（应该生成9个点）
        assert len(grid_points) == 9

        # 检查第一个点
        assert grid_points[0] == [100.0, 100.0]

        # 检查最后一个点
        assert grid_points[-1] == [200.0, 200.0]

    def test_split_polygon(self):
        """测试分割多边形"""
        from shapely.geometry import LineString

        # 创建一条垂直分割线
        line = LineString([(150, 90), (150, 210)])
        result = self.utils.split_polygon(self.square, line)

        # 应该分割成两个多边形
        assert len(result) == 2

        # 检查两个多边形的面积之和等于原面积
        total_area = sum(poly.area for poly in result)
        assert total_area == pytest.approx(10000.0, rel=0.01)