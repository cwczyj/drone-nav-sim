"""
覆盖路径规划模块

该模块提供覆盖路径规划（Coverage Path Planning, CPP）的核心功能，包括：
- 波浪式路径规划（Boustrophedon decomposition）
- 螺旋式路径规划（Spiral coverage）
- 网格分割算法
- 路径优化（减少转弯次数）

该模块实现多种CPP算法，适用于不同形状的农田和不同的作业需求。
"""

from shapely.geometry import Polygon, LineString, Point
from shapely.ops import split, unary_union
import math
from typing import List, Tuple, Optional

from .geo_utils import latlon_to_local, local_to_latlon, get_center_coord


def generate_coverage_path(
    polygon: List[List[float]], 
    swath_width: float = 10.0, 
    start_point: Optional[List[float]] = None,
    is_geographic: bool = True
) -> List[List[float]]:
    """Generate coverage path for a polygon area
    
    Args:
        polygon: Polygon coordinates [[x, y], ...]. 
                 If is_geographic=True: [[lng, lat], ...] in degrees.
                 If is_geographic=False: [[x, y], ...] in meters.
        swath_width: Swath width in meters (default 10m)
        start_point: Optional starting point [x, y]
        is_geographic: Whether input coordinates are geographic (lng, lat)
    
    Returns:
        Path waypoints [[x, y], ...] in the same coordinate system as input
    """
    if is_geographic:
        return _generate_geographic_coverage_path(polygon, swath_width, start_point)
    else:
        planner = CoveragePathPlanner(polygon, swath_width)
        return planner.generate_path(start_point)


def _generate_geographic_coverage_path(
    polygon_lnglat: List[List[float]], 
    swath_width: float = 10.0,
    start_point: Optional[List[float]] = None
) -> List[List[float]]:
    """Generate coverage path for geographic coordinates
    
    Converts geographic coords to local meter coords, generates path,
    then converts back to geographic coords.
    
    Args:
        polygon_lnglat: Polygon coordinates [[lng, lat], ...] in degrees
        swath_width: Swath width in meters
        start_point: Optional starting point [lng, lat]
    
    Returns:
        Path waypoints [[lng, lat], ...] in degrees
    """
    # Convert [lng, lat] to (lat, lon) for geo_utils
    coords_latlon = [(c[1], c[0]) for c in polygon_lnglat]
    
    # Calculate center point as origin
    origin_lat, origin_lon = get_center_coord(coords_latlon)
    
    # Convert to local meter coordinates (returns (x, y) = (east, north))
    local_coords = latlon_to_local(coords_latlon, origin_lat, origin_lon)
    
    # Convert to [x, y] format for CoveragePathPlanner
    local_polygon = [[x, y] for x, y in local_coords]
    
    # Generate path in local coordinates
    planner = CoveragePathPlanner(local_polygon, swath_width)
    local_path = planner.generate_path()
    
    if not local_path:
        return []
    
    # Convert start_point if provided
    local_start = None
    if start_point:
        start_latlon = (start_point[1], start_point[0])
        local_start_list = latlon_to_local([start_latlon], origin_lat, origin_lon)
        local_start = list(local_start_list[0])
    
    # Convert path back to geographic coordinates
    local_path_tuples = [(p[0], p[1]) for p in local_path]
    geo_path_tuples = local_to_latlon(local_path_tuples, origin_lat, origin_lon)
    
    # Convert back to [lng, lat] format
    geo_path = [[lon, lat] for lat, lon in geo_path_tuples]
    
    return geo_path


class CoveragePathPlanner:
    """
    覆盖路径规划器
    
    实现各种覆盖路径规划算法，生成农业无人机的作业航线。
    主要实现Boustrophedon分解算法。
    """
    
    def __init__(self, polygon: List[List[float]], swath_width: float = 10.0):
        """
        初始化路径规划器
        
        Args:
            polygon: 农田多边形坐标列表 [[x, y], ...]
            swath_width: 耕幅宽度（米）
        """
        self.polygon_coords = polygon
        self.swath_width = swath_width
        
        # 创建Shapely多边形对象
        # 确保多边形闭合
        if polygon[0] != polygon[-1]:
            self.polygon = Polygon(polygon + [polygon[0]])
        else:
            self.polygon = Polygon(polygon)
        
        # 验证多边形有效性
        if not self.polygon.is_valid:
            self.polygon = self.polygon.buffer(0)
        
        # 获取边界框
        self.min_x, self.min_y, self.max_x, self.max_y = self.polygon.bounds
    
    def generate_path(self, start_point: Optional[List[float]] = None) -> List[List[float]]:
        """
        生成覆盖路径
        
        Args:
            start_point: 可选的起始点 [x, y]
        
        Returns:
            路径点列表 [[x, y], ...]
        """
        # 使用简化的Boustrophedon方法：水平扫描线
        return self._horizontal_sweep_path(start_point)
    
    def _horizontal_sweep_path(self, start_point: Optional[List[float]] = None) -> List[List[float]]:
        """
        生成水平扫描路径（简化版Boustrophedon）
        
        从底部到顶部生成平行扫描线，在多边形内部生成往返路径。
        
        Args:
            start_point: 可选的起始点
        
        Returns:
            路径点列表
        """
        path = []
        
        # 确定扫描方向（沿Y轴从下到上）
        y_current = self.min_y + self.swath_width / 2
        
        # 确定起始位置
        if start_point is None:
            # 默认从左下角开始
            start_from_left = True
        else:
            # 根据起始点确定初始方向
            start_from_left = start_point[0] < (self.min_x + self.max_x) / 2
        
        left_to_right = start_from_left
        
        while y_current <= self.max_y:
            # 创建水平扫描线
            scan_line = LineString([
                (self.min_x - 1, y_current),
                (self.max_x + 1, y_current)
            ])
            
            # 计算扫描线与多边形的交点
            intersection = self.polygon.intersection(scan_line)
            
            if intersection.is_empty:
                y_current += self.swath_width
                continue
            
            # 获取交点线段
            segments = self._extract_line_segments(intersection)
            
            if not segments:
                y_current += self.swath_width
                continue
            
            # 为每个线段生成路径点
            for segment in segments:
                x_start, x_end = segment
                
                if x_start > x_end:
                    x_start, x_end = x_end, x_start
                
                if left_to_right:
                    path.append([x_start, y_current])
                    path.append([x_end, y_current])
                else:
                    path.append([x_end, y_current])
                    path.append([x_start, y_current])
            
            # 切换方向
            left_to_right = not left_to_right
            y_current += self.swath_width
        
        return path
    
    def _extract_line_segments(self, intersection) -> List[Tuple[float, float]]:
        """
        从交点提取线段
        
        Args:
            intersection: Shapely几何交点对象
        
        Returns:
            线段列表 [(x_start, x_end), ...]
        """
        segments = []
        
        if intersection.geom_type == 'LineString':
            coords = list(intersection.coords)
            if len(coords) >= 2:
                segments.append((coords[0][0], coords[-1][0]))
        elif intersection.geom_type == 'MultiLineString':
            for line in intersection.geoms:
                coords = list(line.coords)
                if len(coords) >= 2:
                    segments.append((coords[0][0], coords[-1][0]))
        elif intersection.geom_type == 'Point':
            # 单点交点，忽略
            pass
        elif intersection.geom_type == 'MultiPoint':
            # 多点交点，忽略
            pass
        elif intersection.geom_type == 'GeometryCollection':
            for geom in intersection.geoms:
                segments.extend(self._extract_line_segments(geom))
        
        return segments
    
    def boustrophedon_decomposition(self) -> List[List[Tuple[float, float]]]:
        """
        波浪式分割算法
        
        将多边形分割为子区域，在每个子区域生成平行路径。
        这是完整的Boustrophedon分解实现。
        
        Returns:
            路径点列表的列表，每个子区域一个路径
        """
        # 查找临界点
        critical_points = self._find_critical_points()
        
        # 在临界点处分割多边形
        cells = self._decompose_at_critical_points(critical_points)
        
        # 为每个单元生成扫描路径
        all_paths = []
        for cell in cells:
            if cell.is_empty or not cell.is_valid:
                continue
            
            # 为每个单元创建临时规划器
            cell_coords = list(cell.exterior.coords)
            cell_planner = CoveragePathPlanner(cell_coords, self.swath_width)
            cell_path = cell_planner._horizontal_sweep_path()
            
            if cell_path:
                all_paths.append([(p[0], p[1]) for p in cell_path])
        
        return all_paths
    
    def _find_critical_points(self) -> List[Tuple[float, float]]:
        """
        查找临界点
        
        临界点是扫描线上连通分量数量发生变化的点。
        
        Returns:
            临界点坐标列表
        """
        critical_points = []
        coords = list(self.polygon.exterior.coords)[:-1]  # 移除闭合点
        
        for i, point in enumerate(coords):
            prev_point = coords[i - 1] if i > 0 else coords[-1]
            next_point = coords[(i + 1) % len(coords)]
            
            # 检查是否为临界点（Y方向变化的顶点）
            prev_y_diff = point[1] - prev_point[1]
            next_y_diff = next_point[1] - point[1]
            
            # 局部极值点或拐点
            if (prev_y_diff > 0 and next_y_diff > 0) or (prev_y_diff < 0 and next_y_diff < 0):
                # 同向变化 - 可能是临界点
                critical_points.append((point[0], point[1]))
            elif prev_y_diff * next_y_diff < 0:
                # 反向变化 - 拐点
                critical_points.append((point[0], point[1]))
        
        return critical_points
    
    def _decompose_at_critical_points(self, critical_points: List[Tuple[float, float]]) -> List[Polygon]:
        """
        在临界点处分解多边形
        
        Args:
            critical_points: 临界点列表
        
        Returns:
            分解后的多边形列表
        """
        if not critical_points:
            return [self.polygon]
        
        # 按Y坐标排序临界点
        sorted_points = sorted(critical_points, key=lambda p: p[1])
        
        # 在每个临界点创建水平分割线
        split_lines = []
        for point in sorted_points:
            line = LineString([
                (self.min_x - 1, point[1]),
                (self.max_x + 1, point[1])
            ])
            split_lines.append(line)
        
        # 合并所有分割线并分割多边形
        if split_lines:
            try:
                merged_lines = unary_union(split_lines)
                result = split(self.polygon, merged_lines)
                
                if result.geom_type == 'Polygon':
                    return [result]
                elif result.geom_type == 'MultiPolygon':
                    return list(result.geoms)
                else:
                    return [self.polygon]
            except Exception:
                # 分割失败，返回原始多边形
                return [self.polygon]
        
        return [self.polygon]
    
    def spiral_coverage(self) -> List[Tuple[float, float]]:
        """
        螺旋式覆盖算法
        
        从外向内生成螺旋路径。适用于形状规则的区域。
        
        Returns:
            路径点列表 [(x, y), ...]
        """
        path = []
        current_polygon = self.polygon
        
        # 迭代收缩多边形
        iteration = 0
        max_iterations = 100  # 防止无限循环
        
        while not current_polygon.is_empty and iteration < max_iterations:
            # 获取当前多边形边界
            coords = list(current_polygon.exterior.coords)
            
            # 添加边界路径
            for coord in coords:
                path.append((coord[0], coord[1]))
            
            # 向内收缩
            current_polygon = current_polygon.buffer(-self.swath_width)
            
            # 清理可能产生的无效多边形
            if not current_polygon.is_empty:
                if current_polygon.geom_type == 'MultiPolygon':
                    # 取最大面积的多边形
                    current_polygon = max(current_polygon.geoms, key=lambda p: p.area)
                elif current_polygon.geom_type != 'Polygon':
                    break
            
            iteration += 1
        
        return path
    
    def grid_based_coverage(self, grid_size: float) -> List[Tuple[float, float]]:
        """
        基于网格的覆盖算法
        
        将区域划分为网格，生成覆盖所有网格的路径。
        
        Args:
            grid_size: 网格大小（米）
            
        Returns:
            路径点列表 [(x, y), ...]
        """
        path = []
        
        # 计算网格数量
        x_steps = int((self.max_x - self.min_x) / grid_size) + 1
        y_steps = int((self.max_y - self.min_y) / grid_size) + 1
        
        # 生成网格点并检查是否在多边形内
        left_to_right = True
        
        for j in range(y_steps):
            y = self.min_y + j * grid_size
            row_points = []
            
            for i in range(x_steps):
                x = self.min_x + i * grid_size
                point = Point(x, y)
                
                if self.polygon.contains(point) or self.polygon.touches(point):
                    row_points.append((x, y))
            
            if row_points:
                if not left_to_right:
                    row_points = row_points[::-1]
                
                path.extend(row_points)
                left_to_right = not left_to_right
        
        return path
    
    def optimize_turns(self, path: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
        """
        优化路径，减少转弯次数
        
        通过合并相邻的平行线段来减少转弯。
        
        Args:
            path: 原始路径
            
        Returns:
            优化后的路径
        """
        if len(path) < 3:
            return path
        
        optimized = [path[0]]
        
        for i in range(1, len(path) - 1):
            prev = optimized[-1]
            curr = path[i]
            next_pt = path[i + 1]
            
            # 计算前一段和当前段的方向
            prev_dir = self._calculate_direction(prev, curr)
            curr_dir = self._calculate_direction(curr, next_pt)
            
            # 如果方向相同，跳过中间点
            if abs(prev_dir - curr_dir) < 0.001:
                continue
            
            optimized.append(curr)
        
        optimized.append(path[-1])
        return optimized
    
    def _calculate_direction(self, p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
        """
        计算两点之间的方向角
        
        Args:
            p1: 起点
            p2: 终点
        
        Returns:
            方向角（弧度）
        """
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        
        if dx == 0 and dy == 0:
            return 0
        
        return math.atan2(dy, dx)
    
    def calculate_path_length(self, path: List[Tuple[float, float]]) -> float:
        """
        计算路径总长度
        
        Args:
            path: 路径点列表
            
        Returns:
            路径总长度（米）
        """
        if len(path) < 2:
            return 0.0
        
        total_length = 0.0
        
        for i in range(len(path) - 1):
            dx = path[i + 1][0] - path[i][0]
            dy = path[i + 1][1] - path[i][1]
            total_length += math.sqrt(dx * dx + dy * dy)
        
        return total_length
    
    def calculate_turn_count(self, path: List[Tuple[float, float]]) -> int:
        """
        计算路径转弯次数
        
        Args:
            path: 路径点列表
            
        Returns:
            转弯次数
        """
        if len(path) < 3:
            return 0
        
        turn_count = 0
        angle_threshold = math.radians(5)  # 5度阈值
        
        for i in range(1, len(path) - 1):
            prev_dir = self._calculate_direction(path[i - 1], path[i])
            curr_dir = self._calculate_direction(path[i], path[i + 1])
            
            angle_diff = abs(prev_dir - curr_dir)
            
            # 归一化角度差
            if angle_diff > math.pi:
                angle_diff = 2 * math.pi - angle_diff
            
            if angle_diff > angle_threshold:
                turn_count += 1
        
        return turn_count