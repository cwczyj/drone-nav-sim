"""
几何工具模块

该模块提供多边形和几何形状处理的核心功能，包括：
- 多边形操作（面积计算、分割、合并）
- 坐标转换（地理坐标到局部坐标）
- 距离计算（点与点、点与多边形）
- 边界框计算

该模块使用shapely库作为核心几何引擎，配合numpy进行高效的数值计算。
"""

from shapely.geometry import Polygon, Point, LineString, MultiPolygon
from shapely.ops import split, unary_union, transform
import numpy as np
from typing import List, Tuple, Optional

from .geo_utils import haversine_distance, spherical_polygon_area, calculate_bearing


# ============ 基础几何函数（从前端移植）============

def calculate_polygon_area(coords: List[List[float]], coord_to_meter: float = 1.0, sqm_to_mu: float = 1.0) -> float:
    """
    使用鞋带公式计算多边形面积

    Args:
        coords: 坐标列表 [[x, y], [x, y], ...]
        coord_to_meter: 坐标单位到米的转换系数
        sqm_to_mu: 平方米到亩的转换系数

    Returns:
        多边形面积（亩）
    """
    if len(coords) < 3:
        return 0

    # 除去最后一个重复点（如果有）
    coords = coords.copy()
    if coords[0] == coords[-1]:
        coords = coords[:-1]

    # 鞋带公式
    area_sqm = 0
    n = len(coords)
    for i in range(n):
        x1, y1 = coords[i]
        x2, y2 = coords[(i + 1) % n]
        area_sqm += x1 * y2 - x2 * y1

    area_sqm = abs(area_sqm) / 2 * (coord_to_meter ** 2)
    area_mu = area_sqm * sqm_to_mu

    return round(area_mu, 2)


def calculate_geodetic_area(coords: List[List[float]], sqm_to_mu: float = 666.67) -> float:
    """
    计算地理多边形面积（球面面积）
    """
    if len(coords) < 3:
        return 0

    tuple_coords = [(c[0], c[1]) for c in coords]

    area_sqm = spherical_polygon_area(tuple_coords)
    area_mu = area_sqm / sqm_to_mu

    return round(area_mu, 2)


def point_in_polygon(point: List[float], polygon: List[List[float]]) -> bool:
    """
    射线法判断点是否在多边形内

    Args:
        point: 点坐标 [x, y]
        polygon: 多边形坐标列表 [[x, y], [x, y], ...]

    Returns:
        True如果在多边形内，否则False
    """
    x, y = point
    n = len(polygon) - 1
    inside = False

    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[i + 1]

        if y1 == y2:
            if x1 == x2:
                if x == x1 and min(y1, y2) <= y <= max(y1, y2):
                    return True
            continue

        if min(y1, y2) <= y <= max(y1, y2):
            x_intersect = x1 + (y - y1) * (x2 - x1) / (y2 - y1)

            if x_intersect >= x:
                inside = not inside

    return inside


def _line_intersects(p1: List[float], p2: List[float], p3: List[float], p4: List[float]) -> bool:
    """
    判断两条线段是否相交

    Args:
        p1, p2: 第一条线段的端点
        p3, p4: 第二条线段的端点

    Returns:
        True如果相交，否则False
    """
    def ccw(a: List[float], b: List[float], c: List[float]) -> bool:
        return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0])

    return (ccw(p1, p3, p4) != ccw(p2, p3, p4)) and (ccw(p1, p2, p3) != ccw(p1, p2, p4))


def polygons_overlap(poly1: List[List[float]], poly2: List[List[float]]) -> bool:
    """
    判断两个多边形是否重叠

    Args:
        poly1: 第一个多边形坐标列表
        poly2: 第二个多边形坐标列表

    Returns:
        True如果重叠，否则False
    """
    poly1_points = poly1[:-1] if poly1[0] == poly1[-1] else poly1
    poly2_points = poly2[:-1] if poly2[0] == poly2[-1] else poly2

    for point in poly1_points:
        if point_in_polygon(point, poly2):
            return True

    for point in poly2_points:
        if point_in_polygon(point, poly1):
            return True

    for i in range(len(poly1_points)):
        for j in range(len(poly2_points)):
            p1 = poly1_points[i]
            p2 = poly1_points[(i + 1) % len(poly1_points)]
            p3 = poly2_points[j]
            p4 = poly2_points[(j + 1) % len(poly2_points)]

            if _line_intersects(p1, p2, p3, p4):
                return True

    return False


# ============ Shapely高级几何函数============

def polygon_centroid(coords: List[List[float]]) -> Tuple[float, float]:
    """
    计算多边形中心点

    Args:
        coords: 多边形坐标列表 [[x, y], [x, y], ...]

    Returns:
        中心点坐标 (x, y)
    """
    poly = Polygon(coords)
    centroid = poly.centroid
    return (centroid.x, centroid.y)


def polygon_bounds(coords: List[List[float]]) -> Tuple[float, float, float, float]:
    """
    获取多边形边界框

    Args:
        coords: 多边形坐标列表 [[x, y], [x, y], ...]

    Returns:
        边界框 (min_x, min_y, max_x, max_y)
    """
    poly = Polygon(coords)
    minx, miny, maxx, maxy = poly.bounds
    return (minx, miny, maxx, maxy)


def simplify_polygon(coords: List[List[float]], tolerance: float = 0.1) -> List[List[float]]:
    """
    简化多边形（减少顶点数量）

    Args:
        coords: 多边形坐标列表 [[x, y], [x, y], ...]
        tolerance: 简化容差（越小越精确）

    Returns:
        简化后的坐标列表
    """
    poly = Polygon(coords)
    simplified = poly.simplify(tolerance, preserve_topology=True)
    return list(simplified.exterior.coords)


def offset_polygon(coords: List[List[float]], distance: float) -> List[List[float]]:
    """
    偏移多边形（向内或向外）

    Args:
        coords: 多边形坐标列表 [[x, y], [x, y], ...]
        distance: 偏移距离（正数向外，负数向内）

    Returns:
        偏移后的坐标列表
    """
    poly = Polygon(coords)
    offset_poly = poly.buffer(distance)
    return list(offset_poly.exterior.coords)


# ============ 多边形工具类============

class PolygonUtils:
    """
    多边形工具类

    提供各种多边形操作工具函数，用于农业无人机航线规划中的几何计算。
    """

    def __init__(self):
        pass

    def calculate_area(self, polygon: Polygon) -> float:
        """
        计算多边形面积

        Args:
            polygon: shapely多边形对象

        Returns:
            多边形面积（平方米）
        """
        return polygon.area

    def split_polygon(self, polygon: Polygon, line: LineString) -> List[Polygon]:
        """
        使用直线分割多边形

        Args:
            polygon: 待分割的多边形
            line: 分割线

        Returns:
            分割后的多边形列表
        """
        result = split(polygon, line)
        return list(result.geoms)

    def distance_to_polygon(self, point: Point, polygon: Polygon) -> float:
        """
        计算点到多边形的最短距离

        Args:
            point: 点对象
            polygon: 多边形对象

        Returns:
            最短距离（米）
        """
        return point.distance(polygon)

    def get_bounding_box(self, polygon: Polygon) -> Tuple[float, float, float, float]:
        """
        获取多边形边界框

        Args:
            polygon: 多边形对象

        Returns:
            边界框坐标 (min_x, min_y, max_x, max_y)
        """
        minx, miny, maxx, maxy = polygon.bounds
        return (minx, miny, maxx, maxy)

    def latlon_to_utm(self, lat: float, lon: float) -> Tuple[float, float]:
        """
        将经纬度坐标转换为UTM坐标

        Args:
            lat: 纬度
            lon: 经度

        Returns:
            UTM坐标 (x, y)
        """
        import pyproj

        # 自动确定UTM区号
        utm_zone = int((lon + 180) / 6) + 1
        hemisphere = 'south' if lat < 0 else 'north'

        # 创建转换器
        proj = pyproj.Proj(proj='utm', zone=utm_zone, ellps='WGS84', south=(hemisphere == 'south'))

        x, y = proj(lon, lat)
        return (x, y)

    def polygon_to_grid(self, polygon: Polygon, grid_size: float) -> List[List[float]]:
        """
        将多边形转换为网格点

        Args:
            polygon: 多边形对象
            grid_size: 网格大小（米）

        Returns:
            网格点列表 [[x, y], ...]
        """
        minx, miny, maxx, maxy = polygon.bounds

        grid_points = []
        x = minx
        while x <= maxx:
            y = miny
            while y <= maxy:
                point = Point(x, y)
                if polygon.contains(point):
                    grid_points.append([x, y])
                y += grid_size
            x += grid_size

        return grid_points