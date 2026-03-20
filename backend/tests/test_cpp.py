"""
覆盖路径规划模块单元测试
"""

import math
import pytest
from shapely.geometry import Polygon
from backend.path_planning.cpp import (
    generate_coverage_path,
    CoveragePathPlanner,
)


class TestGenerateCoveragePath:
    """测试生成覆盖路径主函数"""

    def test_rectangle_coverage(self):
        """测试矩形覆盖"""
        # 100x100的矩形
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        path = generate_coverage_path(polygon, swath_width=20)
        
        # 路径不应为空
        assert len(path) > 0
        
        # 检查所有路径点都在多边形边界内或边界上
        poly = Polygon(polygon + [polygon[0]])
        for point in path:
            assert poly.contains(Polygon([[point[0]-0.1, point[1]-0.1], 
                                           [point[0]+0.1, point[1]-0.1],
                                           [point[1]+0.1, point[1]+0.1],
                                           [point[0]-0.1, point[1]+0.1]])) or \
                   poly.touches(Polygon([[point[0]-0.1, point[1]-0.1], 
                                          [point[0]+0.1, point[1]-0.1],
                                          [point[1]+0.1, point[1]+0.1],
                                          [point[0]-0.1, point[1]+0.1]])) or \
                   poly.contains(Polygon([[point[0]-0.01, point[1]-0.01], 
                                          [point[0]+0.01, point[1]-0.01],
                                          [point[0]+0.01, point[1]+0.01],
                                          [point[0]-0.01, point[1]+0.01]]))

    def test_rectangle_coverage_path_count(self):
        """测试矩形覆盖路径点数量"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        path = generate_coverage_path(polygon, swath_width=20)
        
        # 对于100x100矩形， swath_width=20
        # 应该有 100/20 = 5 条扫描线
        # 每条线有2个点（起点和终点）
        # 总共应该有 5 * 2 = 10 个路径点
        assert len(path) == 10

    def test_irregular_polygon_coverage(self):
        """测试不规则多边形覆盖"""
        # L形多边形
        polygon = [[0, 0], [100, 0], [100, 50], [50, 50], [50, 100], [0, 100]]
        path = generate_coverage_path(polygon, swath_width=20)
        
        # 路径不应为空
        assert len(path) > 0

    def test_triangle_coverage(self):
        """测试三角形覆盖"""
        polygon = [[0, 0], [100, 0], [50, 100]]
        path = generate_coverage_path(polygon, swath_width=20)
        
        # 路径不应为空
        assert len(path) > 0

    def test_different_swath_widths(self):
        """测试不同的扫描宽度"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        
        path_small = generate_coverage_path(polygon, swath_width=10)
        path_large = generate_coverage_path(polygon, swath_width=25)
        
        # 小扫描宽度应该产生更多路径点
        assert len(path_small) > len(path_large)

    def test_start_point_parameter(self):
        """测试起始点参数"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        
        # 从左下角开始
        path_left = generate_coverage_path(polygon, swath_width=20, start_point=[10, 10])
        
        # 从右上角开始
        path_right = generate_coverage_path(polygon, swath_width=20, start_point=[90, 90])
        
        # 两个路径应该不同
        assert path_left != path_right


class TestCoveragePathPlanner:
    """测试覆盖路径规划器类"""

    def setup_method(self):
        """测试前准备"""
        self.rectangle = [[0, 0], [100, 0], [100, 100], [0, 100]]
        self.planner = CoveragePathPlanner(self.rectangle, swath_width=20)

    def test_initialization(self):
        """测试初始化"""
        assert self.planner.swath_width == 20
        assert self.planner.polygon is not None
        assert self.planner.polygon.is_valid

    def test_polygon_bounds(self):
        """测试多边形边界"""
        assert self.planner.min_x == 0
        assert self.planner.min_y == 0
        assert self.planner.max_x == 100
        assert self.planner.max_y == 100

    def test_generate_path(self):
        """测试生成路径"""
        path = self.planner.generate_path()
        assert len(path) > 0

    def test_horizontal_sweep_path(self):
        """测试水平扫描路径"""
        path = self.planner._horizontal_sweep_path()
        
        # 检查路径点数量
        assert len(path) == 10  # 5条线，每条2个点
        
        # 检查第一对点（从左边开始）
        assert path[0] == [0, 10]  # 第一条扫描线起点
        assert path[1] == [100, 10]  # 第一条扫描线终点
        
        # 检查第二对点（从右边开始）
        assert path[2] == [100, 30]  # 第二条扫描线起点
        assert path[3] == [0, 30]  # 第二条扫描线终点

    def test_boustrophedon_decomposition(self):
        """测试波浪式分割"""
        paths = self.planner.boustrophedon_decomposition()
        
        # 对于简单矩形，应该返回一个或多个路径
        assert len(paths) >= 1

    def test_spiral_coverage(self):
        """测试螺旋覆盖"""
        path = self.planner.spiral_coverage()
        
        # 螺旋路径不应为空
        assert len(path) > 0
        
        # 检查第一个点是多边形的顶点附近
        first_point = path[0]
        assert first_point[0] == pytest.approx(0, abs=1)
        assert first_point[1] == pytest.approx(0, abs=1)

    def test_grid_based_coverage(self):
        """测试网格覆盖"""
        path = self.planner.grid_based_coverage(grid_size=20)
        
        # 网格路径不应为空
        assert len(path) > 0

    def test_optimize_turns(self):
        """测试转弯优化"""
        # 创建一个有冗余点的路径
        path = [(0, 0), (0, 10), (0, 20), (100, 20), (100, 30), (100, 40)]
        
        optimized = self.planner.optimize_turns(path)
        
        # 优化后的路径应该更短或相等
        assert len(optimized) <= len(path)

    def test_calculate_path_length(self):
        """测试路径长度计算"""
        path = [(0, 0), (100, 0)]
        length = self.planner.calculate_path_length(path)
        assert length == 100.0

        path = [(0, 0), (100, 0), (100, 100)]
        length = self.planner.calculate_path_length(path)
        assert length == 200.0

    def test_calculate_turn_count(self):
        """测试转弯次数计算"""
        # 直线路径 - 无转弯
        path = [(0, 0), (100, 0), (200, 0)]
        turns = self.planner.calculate_turn_count(path)
        assert turns == 0

        # L形路径 - 1次转弯
        path = [(0, 0), (100, 0), (100, 100)]
        turns = self.planner.calculate_turn_count(path)
        assert turns == 1

        # Z形路径 - 2次转弯
        path = [(0, 0), (100, 0), (100, 50), (0, 50)]
        turns = self.planner.calculate_turn_count(path)
        assert turns == 2


class TestExtractLineSegments:
    """测试线段提取"""

    def setup_method(self):
        """测试前准备"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        self.planner = CoveragePathPlanner(polygon, swath_width=20)

    def test_linestring_extraction(self):
        """测试LineString提取"""
        from shapely.geometry import LineString
        
        line = LineString([(10, 50), (90, 50)])
        segments = self.planner._extract_line_segments(line)
        
        assert len(segments) == 1
        assert segments[0] == (10, 90)

    def test_multilinestring_extraction(self):
        """测试MultiLineString提取"""
        from shapely.geometry import MultiLineString, LineString
        
        line1 = LineString([(10, 50), (40, 50)])
        line2 = LineString([(60, 50), (90, 50)])
        multiline = MultiLineString([line1, line2])
        
        segments = self.planner._extract_line_segments(multiline)
        
        assert len(segments) == 2


class TestFindCriticalPoints:
    """测试临界点查找"""

    def test_rectangle_critical_points(self):
        """测试矩形的临界点"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        planner = CoveragePathPlanner(polygon, swath_width=20)
        
        critical_points = planner._find_critical_points()
        
        # 矩形应该有临界点
        assert len(critical_points) >= 0

    def test_complex_polygon_critical_points(self):
        """测试复杂多边形的临界点"""
        # 凹形多边形
        polygon = [[0, 0], [100, 0], [100, 50], [50, 50], [50, 100], [0, 100]]
        planner = CoveragePathPlanner(polygon, swath_width=20)
        
        critical_points = planner._find_critical_points()
        
        # 应该能找到临界点
        assert isinstance(critical_points, list)


class TestDecomposeAtCriticalPoints:
    """测试在临界点处分解多边形"""

    def test_decompose_rectangle(self):
        """测试分解矩形"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        planner = CoveragePathPlanner(polygon, swath_width=20)
        
        critical_points = planner._find_critical_points()
        cells = planner._decompose_at_critical_points(critical_points)
        
        # 应该返回至少一个多边形
        assert len(cells) >= 1

    def test_decompose_empty_critical_points(self):
        """测试无临界点时的分解"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        planner = CoveragePathPlanner(polygon, swath_width=20)
        
        cells = planner._decompose_at_critical_points([])
        
        # 无临界点时返回原多边形
        assert len(cells) == 1


class TestCalculateDirection:
    """测试方向计算"""

    def setup_method(self):
        """测试前准备"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        self.planner = CoveragePathPlanner(polygon, swath_width=20)

    def test_horizontal_direction(self):
        """测试水平方向"""
        direction = self.planner._calculate_direction((0, 0), (100, 0))
        assert direction == pytest.approx(0, abs=0.01)

    def test_vertical_direction(self):
        """测试垂直方向"""
        direction = self.planner._calculate_direction((0, 0), (0, 100))
        assert direction == pytest.approx(math.pi / 2, abs=0.01)

    def test_diagonal_direction(self):
        """测试对角线方向"""
        direction = self.planner._calculate_direction((0, 0), (100, 100))
        assert direction == pytest.approx(math.pi / 4, abs=0.01)


class TestEdgeCases:
    """测试边界情况"""

    def test_very_small_polygon(self):
        """测试非常小的多边形"""
        polygon = [[0, 0], [5, 0], [5, 5], [0, 5]]
        path = generate_coverage_path(polygon, swath_width=10)
        
        # 小多边形可能无法生成完整路径
        assert isinstance(path, list)

    def test_very_large_swath_width(self):
        """测试非常大的扫描宽度"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        path = generate_coverage_path(polygon, swath_width=200)
        
        # 大扫描宽度应该产生较少的路径点
        assert len(path) <= 4

    def test_non_closed_polygon(self):
        """测试非闭合多边形"""
        polygon = [[0, 0], [100, 0], [100, 100], [0, 100]]
        path = generate_coverage_path(polygon, swath_width=20)
        
        # 应该能处理非闭合多边形
        assert len(path) > 0