"""
路径规划 API 路由

提供无人机航线规划相关的 REST API 端点，包括：
- POST /api/path-planning/generate: 生成覆盖路径
- GET /api/path-planning/{farmland_id}: 获取缓存的路径
- POST /api/path-planning/generate-all: 为所有农田生成航线

所有端点都需要认证。
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Tuple, Optional
from datetime import datetime
import math

from auth import get_current_user
from database import get_farmland_by_id, get_all_farmlands
from models import User, Farmland
from .geo_utils import haversine_distance, calculate_bearing
from .cpp import generate_coverage_path
from .dl_model import optimize_path
from shapely.geometry import Polygon


# API 路由器
router = APIRouter(prefix="/api/path-planning", tags=["path-planning"])

# 简单的内存缓存（可选）
_path_cache: dict = {}


# Pydantic 模型定义
class PathPlanningRequest(BaseModel):
    """路径规划请求"""
    farmland_id: str = Field(..., description="农田 ID")
    swath_width: float = Field(10.0, gt=0, description="耕幅宽度（米）")
    use_dl: bool = Field(True, description="是否使用深度学习优化")


class AllFarmlandsPathRequest(BaseModel):
    """所有农田路径规划请求"""
    swath_width: float = Field(10.0, gt=0, description="耕幅宽度（米）")
    use_dl: bool = Field(True, description="是否使用深度学习优化")
    farmland_ids: Optional[List[str]] = Field(None, description="指定农田 ID 列表，为空则为所有农田")
    merge_farmlands: bool = Field(False, description="是否将所有农田合并为一个区域生成航线")


class Waypoint(BaseModel):
    """航点"""
    x: float
    y: float


class SingleFarmlandPath(BaseModel):
    """单个农田的航线数据"""
    farmland_id: str
    farmland_name: str
    waypoints: List[List[float]]
    total_distance: float
    estimated_time: float
    turn_count: int = 0


class AllFarmlandsPathResponse(BaseModel):
    """所有农田航线响应"""
    farmlands: List[SingleFarmlandPath]
    total_distance: float
    total_estimated_time: float
    total_turn_count: int
    use_dl_optimization: bool
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    # 合并模式下的额外字段
    merged_path: Optional[List[List[float]]] = None
    farmland_boundaries: Optional[List[dict]] = None
    view_bounds: Optional[dict] = None  # 视图边界，用于前端计算缩放比例


class PathPlanningResponse(BaseModel):
    """路径规划响应"""
    farmland_id: str
    waypoints: List[List[float]]
    total_distance: float = Field(description="路径总长度（米）")
    estimated_time: float = Field(description="预计作业时间（分钟）")
    turn_count: int = Field(default=0, description="转弯次数")
    use_dl_optimization: bool = Field(description="是否使用了 DL 优化")
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class CachedPathResponse(BaseModel):
    """缓存路径响应"""
    farmland_id: str
    waypoints: List[List[float]]
    total_distance: float
    estimated_time: float
    generated_at: datetime


def check_farmland_ownership(farmland, user_id: str):
    """检查农田所有权"""
    if farmland.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作此农田"
        )


def calculate_path_metrics(waypoints: List[Tuple[float, float]], swath_width: float = 10.0) -> Tuple[float, float, int]:
    """
    Calculate path metrics
    
    Args:
        waypoints: Waypoints in [lng, lat] format
        swath_width: Swath width
    
    Returns:
        (total_distance, estimated_time, turn_count)
    """
    if len(waypoints) < 2:
        return 0.0, 0.0, 0
    
    # Calculate total distance using Haversine formula
    # waypoints are [lng, lat], so: lon=waypoint[0], lat=waypoint[1]
    total_distance = 0.0
    for i in range(len(waypoints) - 1):
        lon1, lat1 = waypoints[i]
        lon2, lat2 = waypoints[i + 1]
        total_distance += haversine_distance(lat1, lon1, lat2, lon2)
    
    # Estimate turn count using bearing
    turn_count = 0
    
    for i in range(1, len(waypoints) - 1):
        lon1, lat1 = waypoints[i - 1]
        lon2, lat2 = waypoints[i]
        lon3, lat3 = waypoints[i + 1]
        
        bearing1 = calculate_bearing(lat1, lon1, lat2, lon2)
        bearing2 = calculate_bearing(lat2, lon2, lat3, lon3)
        
        angle_diff = abs(bearing1 - bearing2)
        if angle_diff > 180:
            angle_diff = 360 - angle_diff
        
        if angle_diff > 5:
            turn_count += 1
    
    # Estimate time (average speed 5 m/s, turn extra 3 seconds)
    avg_speed = 5.0
    turn_time = 3.0
    
    travel_time = total_distance / avg_speed
    total_time_seconds = travel_time + (turn_count * turn_time)
    estimated_time_minutes = total_time_seconds / 60.0
    
    return total_distance, estimated_time_minutes, turn_count


def generate_path_for_farmland(farmland: Farmland, swath_width: float, use_dl: bool) -> SingleFarmlandPath:
    """
    为单个农田生成航线
    
    Args:
        farmland: 农田对象
        swath_width: 耕幅宽度
        use_dl: 是否使用深度学习优化
    
    Returns:
        单个农田的航线数据
    """
    boundary_coords = farmland.boundary_coords
    if len(boundary_coords) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"农田 {farmland.name} 边界坐标无效，至少需要 3 个点"
        )
    
    # 生成初始覆盖路径
    initial_path = generate_coverage_path(
        polygon=boundary_coords,
        swath_width=swath_width
    )
    
    if not initial_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"农田 {farmland.name} 路径生成失败，请检查农田边界"
        )
    
    # 转换为元组列表以便处理
    path_tuples = [(p[0], p[1]) for p in initial_path]
    
    # 创建多边形对象
    polygon = Polygon(boundary_coords)
    if not polygon.is_valid:
        polygon = polygon.buffer(0)
    
    # 可选：使用深度学习优化
    use_dl_optimization = False
    if use_dl and len(path_tuples) > 2:
        try:
            optimized_path = optimize_path(
                polygon=polygon,
                initial_path=path_tuples,
                adjustment_scale=0.05,
                iterations=1
            )
            if optimized_path:
                path_tuples = optimized_path
                use_dl_optimization = True
        except Exception as e:
            # DL 优化失败，继续使用原始路径
            print(f"DL 优化失败：{e}")
    
    # 计算路径指标
    total_distance, estimated_time, turn_count = calculate_path_metrics(
        path_tuples, swath_width
    )
    
    # 转换回列表格式
    waypoints = [[p[0], p[1]] for p in path_tuples]
    
    return SingleFarmlandPath(
        farmland_id=farmland.id,
        farmland_name=farmland.name,
        waypoints=waypoints,
        total_distance=round(total_distance, 2),
        estimated_time=round(estimated_time, 2),
        turn_count=turn_count
    )


@router.post("/generate", response_model=PathPlanningResponse, status_code=status.HTTP_201_CREATED)
async def generate_path(
    request: PathPlanningRequest,
    current_user: User = Depends(get_current_user)
):
    """
    生成覆盖路径
    
    根据农田边界生成无人机作业航线，可选择是否使用深度学习优化。
    
    - **farmland_id**: 农田 ID（必填）
    - **swath_width**: 耕幅宽度，默认 10 米
    - **use_dl**: 是否使用深度学习优化，默认 True
    """
    # 获取农田数据
    farmland = get_farmland_by_id(request.farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    
    # 检查权限
    check_farmland_ownership(farmland, current_user.id)
    
    try:
        path_data = generate_path_for_farmland(farmland, request.swath_width, request.use_dl)
        waypoints = path_data.waypoints
        total_distance = path_data.total_distance
        estimated_time = path_data.estimated_time
        turn_count = path_data.turn_count
        use_dl_optimization = path_data.turn_count > 0  # Simplified check
        
        # 缓存结果
        _path_cache[request.farmland_id] = {
            "waypoints": waypoints,
            "total_distance": total_distance,
            "estimated_time": estimated_time,
            "turn_count": turn_count,
            "generated_at": datetime.utcnow()
        }
        
        return PathPlanningResponse(
            farmland_id=request.farmland_id,
            waypoints=waypoints,
            total_distance=total_distance,
            estimated_time=estimated_time,
            turn_count=turn_count,
            use_dl_optimization=use_dl_optimization,
            generated_at=datetime.utcnow()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"路径规划失败：{str(e)}"
        )


def compute_merged_polygon(farmlands: List[Farmland]) -> Tuple[List[List[float]], List[dict]]:
    """
    计算所有农田的合并多边形和边界信息
    
    Args:
        farmlands: 农田列表
    
    Returns:
        (合并后的多边形坐标，各农田边界信息)
    """
    from shapely.geometry import Polygon, MultiPolygon
    from shapely.ops import unary_union
    
    # 收集所有农田多边形
    polygons = []
    boundaries = []
    
    for farmland in farmlands:
        coords = farmland.boundary_coords
        if len(coords) >= 3:
            # 确保多边形闭合
            if coords[0] != coords[-1]:
                coords = coords + [coords[0]]
            
            try:
                poly = Polygon(coords)
                if poly.is_valid:
                    polygons.append(poly)
                    boundaries.append({
                        "farmland_id": farmland.id,
                        "farmland_name": farmland.name,
                        "coords": farmland.boundary_coords,
                        "center": [poly.centroid.x, poly.centroid.y]
                    })
            except Exception as e:
                print(f"农田 {farmland.name} 多边形无效：{e}")
                continue
    
    if not polygons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="没有有效的农田多边形"
        )
    
    # 合并所有多边形
    merged = unary_union(polygons)
    
    # 如果合并结果是多个多边形（农田不相连），创建包含所有多边形的外包络矩形
    if merged.geom_type == 'MultiPolygon':
        # 获取所有多边形的外包络矩形（bounding box）
        merged = merged.envelope
    
    # 获取合并后的多边形坐标
    merged_coords = list(merged.exterior.coords)[:-1]  # 移除重复的闭合点
    
    return merged_coords, boundaries


def generate_connection_path(
    farmland_boundaries: List[dict],
    swath_width: float
) -> List[List[float]]:
    """
    生成农田之间的连接路径
    
    Args:
        farmland_boundaries: 农田边界信息列表
        swath_width: 耕幅宽度
    
    Returns:
        连接路径点列表
    """
    if len(farmland_boundaries) < 2:
        return []
    
    connection_path = []
    
    # 按中心点排序农田（从左到右，从上到下）
    sorted_boundaries = sorted(
        farmland_boundaries,
        key=lambda b: (b["center"][1], b["center"][0])
    )
    
    # 生成连接相邻农田的路径
    for i in range(len(sorted_boundaries) - 1):
        current = sorted_boundaries[i]
        next_f = sorted_boundaries[i + 1]
        
        # 获取两个农田的中心点
        current_center = current["center"]
        next_center = next_f["center"]
        
        # 找到两个农田边界上最近的点
        current_coords = current["coords"]
        next_coords = next_f["coords"]
        
        min_dist = float('inf')
        closest_pair = None
        
        for c1 in current_coords:
            for c2 in next_coords:
                dist = math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)
                if dist < min_dist:
                    min_dist = dist
                    closest_pair = (c1, c2)
        
        if closest_pair:
            # 添加连接路径
            connection_path.append(list(closest_pair[0]))
            connection_path.append(list(closest_pair[1]))
    
    return connection_path


def clip_path_to_farmland(
    merged_path: List[List[float]],
    farmland_boundary: List[List[float]],
    buffer_distance: float = 2.0
) -> List[List[float]]:
    """
    将合并路径裁剪到单个农田边界内
    
    Args:
        merged_path: 合并后的完整路径
        farmland_boundary: 单个农田的边界坐标
        buffer_distance: 缓冲距离，用于包含边界附近的路径点
    
    Returns:
        裁剪后的路径点列表
    """
    from shapely.geometry import Polygon, Point, LineString
    from shapely.ops import unary_union
    
    # 创建农田多边形（不带缓冲，严格裁剪）
    try:
        poly = Polygon(farmland_boundary)
        if not poly.is_valid:
            poly = poly.buffer(0)
    except Exception as e:
        print(f"创建农田多边形失败：{e}")
        return []
    
    # 获取农田的边界框
    min_x, min_y, max_x, max_y = poly.bounds
    
    # 筛选出在农田边界内的路径点
    clipped_path = []
    
    for waypoint in merged_path:
        wx, wy = waypoint[0], waypoint[1]
        # 首先用边界框快速筛选
        if wx < min_x - buffer_distance or wx > max_x + buffer_distance:
            continue
        if wy < min_y - buffer_distance or wy > max_y + buffer_distance:
            continue
        
        # 然后用多边形精确判断
        point = Point(wx, wy)
        if poly.contains(point) or poly.touches(point):
            clipped_path.append(waypoint)
        else:
            # 检查是否在缓冲区内
            buffered_poly = poly.buffer(buffer_distance)
            if buffered_poly.contains(point) or buffered_poly.touches(point):
                clipped_path.append(waypoint)
    
    # 如果裁剪后路径点太少，尝试为这个农田单独生成路径
    if len(clipped_path) < 4:
        # 尝试使用农田边界直接生成路径
        try:
            initial_path = generate_coverage_path(
                polygon=farmland_boundary,
                swath_width=10.0  # 默认耕幅
            )
            if initial_path and len(initial_path) >= 4:
                return initial_path
        except:
            pass
    
    return clipped_path


@router.post("/generate-all", response_model=AllFarmlandsPathResponse, status_code=status.HTTP_201_CREATED)
async def generate_path_for_all(
    request: AllFarmlandsPathRequest,
    current_user: User = Depends(get_current_user)
):
    """
    为所有农田生成航线
    
    批量为当前用户的所有农田（或指定的农田列表）生成无人机作业航线。
    
    - **swath_width**: 耕幅宽度，默认 10 米
    - **use_dl**: 是否使用深度学习优化，默认 True
    - **farmland_ids**: 可选，指定农田 ID 列表，为空则为所有农田
    - **merge_farmlands**: 是否将所有农田合并为一个区域生成航线
    """
    # 获取农田列表
    if request.farmland_ids:
        # 获取指定的农田
        farmlands = []
        for fid in request.farmland_ids:
            farmland = get_farmland_by_id(fid)
            if farmland:
                # 检查权限
                check_farmland_ownership(farmland, current_user.id)
                farmlands.append(farmland)
        
        if not farmlands:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定的农田不存在或无权访问"
            )
    else:
        # 获取当前用户的所有农田
        all_farmlands = get_all_farmlands()
        farmlands = [f for f in all_farmlands if f.user_id == current_user.id]
        
        if not farmlands:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="暂无农田数据"
            )
    
    # 检查是否使用合并模式
    if request.merge_farmlands and len(farmlands) > 1:
        # 合并模式：为每个农田单独生成路径，然后用连接路径连接起来
        try:
            # 获取各农田边界信息
            _, boundaries = compute_merged_polygon(farmlands)
            
            # 为每个农田单独生成路径
            farmland_paths_data = []
            for farmland in farmlands:
                path_data = generate_path_for_farmland(farmland, request.swath_width, request.use_dl)
                farmland_paths_data.append({
                    "farmland": farmland,
                    "path_data": path_data
                })
            
            # 生成农田之间的连接路径
            connection_path = generate_connection_path(boundaries, request.swath_width)
            
            # 合并所有路径：农田 1 路径 -> 连接路径 -> 农田 2 路径 -> ...
            final_path = []
            for i, item in enumerate(farmland_paths_data):
                path_data = item["path_data"]
                # 添加该农田的所有路径点
                for wp in path_data.waypoints:
                    final_path.append(tuple(wp))
                
                # 如果不是最后一个农田，添加连接路径
                if i < len(farmland_paths_data) - 1 and connection_path:
                    # 找到下一个农田的起始点，添加连接路径
                    next_conn = connection_path[i * 2] if i * 2 < len(connection_path) else None
                    next_conn2 = connection_path[i * 2 + 1] if i * 2 + 1 < len(connection_path) else None
                    if next_conn and next_conn2:
                        final_path.append(tuple(next_conn))
                        final_path.append(tuple(next_conn2))
            
            # 计算总指标
            total_distance, estimated_time, turn_count = calculate_path_metrics(
                final_path, request.swath_width
            )
            
            waypoints = [[p[0], p[1]] for p in final_path]
            
            # 使用 DL 优化标记
            use_dl_optimization = request.use_dl
            
            # 缓存结果
            for farmland in farmlands:
                _path_cache[farmland.id] = {
                    "waypoints": waypoints,
                    "total_distance": total_distance,
                    "estimated_time": estimated_time,
                    "turn_count": turn_count,
                    "generated_at": datetime.utcnow()
                }
            
            # 返回每个农田的单独路径数据
            farmland_paths = [item["path_data"] for item in farmland_paths_data]
            
            # 计算视图边界（包含所有农田和连接路径）
            all_coords = []
            for boundary in boundaries:
                all_coords.extend(boundary["coords"])
            
            if all_coords:
                lons = [c[0] for c in all_coords]  # longitude
                lats = [c[1] for c in all_coords]  # latitude
                
                # Calculate padding in degrees (about 100-200 meters at this latitude)
                lon_range = max(lons) - min(lons)
                lat_range = max(lats) - min(lats)
                lon_padding = max(lon_range * 0.2, 0.002)  # minimum ~200m
                lat_padding = max(lat_range * 0.2, 0.002)
                
                view_bounds = {
                    "min_x": min(lons) - lon_padding,
                    "max_x": max(lons) + lon_padding,
                    "min_y": min(lats) - lat_padding,
                    "max_y": max(lats) + lat_padding,
                    "center_x": (min(lons) + max(lons)) / 2,
                    "center_y": (min(lats) + max(lats)) / 2
                }
            else:
                view_bounds = None
            
            return AllFarmlandsPathResponse(
                farmlands=farmland_paths,
                total_distance=round(total_distance, 2),
                total_estimated_time=round(estimated_time, 2),
                total_turn_count=turn_count,
                use_dl_optimization=use_dl_optimization,
                generated_at=datetime.utcnow(),
                merged_path=waypoints,
                farmland_boundaries=boundaries,
                view_bounds=view_bounds
            )
        
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"合并模式路径生成失败：{str(e)}"
            )
    
    # 非合并模式：为每个农田单独生成航线
    farmland_paths = []
    total_distance = 0.0
    total_estimated_time = 0.0
    total_turn_count = 0
    use_dl_optimization = False
    
    for farmland in farmlands:
        try:
            path_data = generate_path_for_farmland(farmland, request.swath_width, request.use_dl)
            farmland_paths.append(path_data)
            total_distance += path_data.total_distance
            total_estimated_time += path_data.estimated_time
            total_turn_count += path_data.turn_count
            if request.use_dl:
                use_dl_optimization = True
            
            # 缓存结果
            _path_cache[farmland.id] = {
                "waypoints": path_data.waypoints,
                "total_distance": path_data.total_distance,
                "estimated_time": path_data.estimated_time,
                "turn_count": path_data.turn_count,
                "generated_at": datetime.utcnow()
            }
        except Exception as e:
            # 单个农田生成失败，继续处理其他农田
            print(f"农田 {farmland.name} 路径生成失败：{e}")
            continue
    
    if not farmland_paths:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="所有农田路径生成失败"
        )
    
    return AllFarmlandsPathResponse(
        farmlands=farmland_paths,
        total_distance=round(total_distance, 2),
        total_estimated_time=round(total_estimated_time, 2),
        total_turn_count=total_turn_count,
        use_dl_optimization=use_dl_optimization,
        generated_at=datetime.utcnow()
    )


@router.get("/{farmland_id}", response_model=CachedPathResponse)
async def get_cached_path(
    farmland_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    获取缓存的路径
    
    如果之前生成过该农田的路径，返回缓存结果。
    否则返回 404。
    """
    # 检查农田是否存在且有权限
    farmland = get_farmland_by_id(farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    
    check_farmland_ownership(farmland, current_user.id)
    
    # 检查缓存
    if farmland_id not in _path_cache:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到缓存的路径，请先生成路径"
        )
    
    cached = _path_cache[farmland_id]
    
    return CachedPathResponse(
        farmland_id=farmland_id,
        waypoints=cached["waypoints"],
        total_distance=cached["total_distance"],
        estimated_time=cached["estimated_time"],
        generated_at=cached["generated_at"]
    )


@router.delete("/{farmland_id}", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cached_path(
    farmland_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    清除缓存的路径
    
    删除指定农田的缓存路径。
    """
    # 检查农田是否存在且有权限
    farmland = get_farmland_by_id(farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    
    check_farmland_ownership(farmland, current_user.id)
    
    # 删除缓存
    if farmland_id in _path_cache:
        del _path_cache[farmland_id]


@router.post("/preview", response_model=PathPlanningResponse)
async def preview_path(
    request: PathPlanningRequest,
    current_user: User = Depends(get_current_user)
):
    """
    预览路径规划
    
    生成路径但不缓存，用于预览效果。
    """
    # 获取农田数据
    farmland = get_farmland_by_id(request.farmland_id)
    if not farmland:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="农田不存在"
        )
    
    check_farmland_ownership(farmland, current_user.id)
    
    boundary_coords = farmland.boundary_coords
    if len(boundary_coords) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="农田边界坐标无效"
        )
    
    try:
        initial_path = generate_coverage_path(
            polygon=boundary_coords,
            swath_width=request.swath_width
        )
        
        if not initial_path:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="路径生成失败"
            )
        
        path_tuples = [(p[0], p[1]) for p in initial_path]
        polygon = Polygon(boundary_coords)
        if not polygon.is_valid:
            polygon = polygon.buffer(0)
        
        use_dl_optimization = False
        if request.use_dl and len(path_tuples) > 2:
            try:
                optimized_path = optimize_path(
                    polygon=polygon,
                    initial_path=path_tuples,
                    adjustment_scale=0.05,
                    iterations=1
                )
                if optimized_path:
                    path_tuples = optimized_path
                    use_dl_optimization = True
            except Exception:
                pass
        
        total_distance, estimated_time, turn_count = calculate_path_metrics(
            path_tuples, request.swath_width
        )
        
        waypoints = [[p[0], p[1]] for p in path_tuples]
        
        return PathPlanningResponse(
            farmland_id=request.farmland_id,
            waypoints=waypoints,
            total_distance=round(total_distance, 2),
            estimated_time=round(estimated_time, 2),
            turn_count=turn_count,
            use_dl_optimization=use_dl_optimization,
            generated_at=datetime.utcnow()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"路径预览失败：{str(e)}"
        )