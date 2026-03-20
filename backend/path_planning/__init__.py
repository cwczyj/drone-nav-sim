"""
路径规划模块

该模块提供了农业无人机航线导航规划的核心功能，包括：
- 几何工具（多边形处理、坐标转换）
- 覆盖路径规划（Coverage Path Planning, CPP）
- 深度学习模型（基于PyTorch的路径优化）
- 路径优化器（使用scipy进行优化）

该模块的设计遵循模块化原则，每个子模块负责特定的功能。
"""

from .geometry import *
from .cpp import *
from .dl_model import *
from .optimizer import *

__all__ = [
    # 几何工具
    'PolygonUtils',
    
    # 覆盖路径规划
    'CoveragePathPlanner',
    
    # 深度学习模型
    'DeepLearningModel',
    
    # 路径优化
    'PathOptimizer',
]

__version__ = '0.1.0'