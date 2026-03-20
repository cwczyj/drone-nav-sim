"""
路径规划API路由

提供无人机航线规划相关的REST API端点，包括：
- POST /api/path-planning/generate: 生成覆盖路径
- GET /api/path-planning/{farmland_id}: 获取缓存的路径

所有端点都需要认证。
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Tuple
from datetime import datetime
import math

from auth import get_current_user
from database import get_farmland_by_id
from models import User
from .cpp import generate_coverage_path
from .dl_model import optimize_path
from shapely.geometry import Polygon


# API路由器
router = APIRouter(prefix="/api/path-planning", tags=["path-planning"])

# 简单的内存缓存（可选）
_path_cache: dict = {}


# Pydantic模型定义
class PathPlanningRequest(BaseModel):
    """路径规划请求"""
    farmland_id: str = Field(..., description="农田ID")
    swath_width: float = Field(10.0, gt=0, description="耕幅宽度（米）")
    use_dl: bool = Field(True, description="是否使用深度学习优化")


class Waypoint(BaseModel):
    """航点"""
    x: float
    y: float


class PathPlanningResponse(BaseModel):
    """路径规划响应"""
    farmland_id: str
    waypoints: List[List[float]]
    total_distance: float = Field(description="路径总长度（米）")
    estimated_time: float = Field(description="预计作业时间（分钟）")
    turn_count: int = Field(default=0, description="转弯次数")
    use_dl_optimization: bool = Field(description="是否使用了DL优化")
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
    计算路径指标
    
    Args:
        waypoints: 航点列表
        swath_width: 耕幅宽度
    
    Returns:
        (总距离, 预计时间, 转弯次数)
    """
    if len(waypoints) < 2:
        return 0.0, 0.0, 0
    
    # 计算总距离
    total_distance = 0.0
    for i in range(len(waypoints) - 1):
        dx = waypoints[i + 1][0] - waypoints[i][0]
        dy = waypoints[i + 1][1] - waypoints[i][1]
        total_distance += math.sqrt(dx * dx + dy * dy)
    
    # 估算转弯次数（方向变化超过阈值）
    turn_count = 0
    angle_threshold = math.radians(5)  # 5度阈值
    
    for i in range(1, len(waypoints) - 1):
        prev_dir = math.atan2(
            waypoints[i][1] - waypoints[i - 1][1],
            waypoints[i][0] - waypoints[i - 1][0]
        )
        curr_dir = math.atan2(
            waypoints[i + 1][1] - waypoints[i][1],
            waypoints[i + 1][0] - waypoints[i][0]
        )
        
        angle_diff = abs(prev_dir - curr_dir)
        if angle_diff > math.pi:
            angle_diff = 2 * math.pi - angle_diff
        
        if angle_diff > angle_threshold:
            turn_count += 1
    
    # 估算时间（假设平均速度5米/秒，转弯额外3秒）
    avg_speed = 5.0  # 米/秒
    turn_time = 3.0  # 秒
    
    travel_time = total_distance / avg_speed
    total_time_seconds = travel_time + (turn_count * turn_time)
    estimated_time_minutes = total_time_seconds / 60.0
    
    return total_distance, estimated_time_minutes, turn_count


@router.post("/generate", response_model=PathPlanningResponse, status_code=status.HTTP_201_CREATED)
async def generate_path(
    request: PathPlanningRequest,
    current_user: User = Depends(get_current_user)
):
    """
    生成覆盖路径
    
    根据农田边界生成无人机作业航线，可选择是否使用深度学习优化。
    
    - **farmland_id**: 农田ID（必填）
    - **swath_width**: 耕幅宽度，默认10米
    - **use_dl**: 是否使用深度学习优化，默认True
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
    
    # 获取边界坐标
    boundary_coords = farmland.boundary_coords
    if len(boundary_coords) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="农田边界坐标无效，至少需要3个点"
        )
    
    try:
        # 生成初始覆盖路径
        initial_path = generate_coverage_path(
            polygon=boundary_coords,
            swath_width=request.swath_width
        )
        
        if not initial_path:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="路径生成失败，请检查农田边界"
            )
        
        # 转换为元组列表以便处理
        path_tuples = [(p[0], p[1]) for p in initial_path]
        
        # 创建多边形对象
        polygon = Polygon(boundary_coords)
        if not polygon.is_valid:
            polygon = polygon.buffer(0)
        
        # 可选：使用深度学习优化
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
            except Exception as e:
                # DL优化失败，继续使用原始路径
                print(f"DL优化失败: {e}")
        
        # 计算路径指标
        total_distance, estimated_time, turn_count = calculate_path_metrics(
            path_tuples, request.swath_width
        )
        
        # 转换回列表格式
        waypoints = [[p[0], p[1]] for p in path_tuples]
        
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
            detail=f"路径规划失败: {str(e)}"
        )


@router.get("/{farmland_id}", response_model=CachedPathResponse)
async def get_cached_path(
    farmland_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    获取缓存的路径
    
    如果之前生成过该农田的路径，返回缓存结果。
    否则返回404。
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
            detail=f"路径预览失败: {str(e)}"
        )