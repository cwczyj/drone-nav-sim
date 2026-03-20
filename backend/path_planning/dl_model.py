"""
深度学习模型模块

该模块提供基于深度学习的路径规划模型，包括：
- 神经网络模型定义（基于PyTorch）
- 模型推理接口
- 特征工程和数据预处理
- 模型加载和保存

该模块使用PyTorch实现神经网络，用于学习最优路径规划策略。
MVP版本使用随机初始化权重，无需训练即可运行。
"""

import torch
import torch.nn as nn
import numpy as np
from typing import List, Tuple, Optional
from shapely.geometry import Polygon
from pathlib import Path
import os

# 模型保存目录
MODELS_DIR = Path(__file__).parent / "models"


def _ensure_models_dir():
    """确保模型目录存在"""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


class PathOptimizer(nn.Module):
    """
    路径优化神经网络
    
    简单的MLP架构，用于优化无人机路径规划。
    输入：多边形特征 + 航点上下文
    输出：航点调整量 (dx, dy)
    
    架构：
    - 输入层：多边形特征(6) + 当前航点(2) + 前一航点(2) + 后一航点(2) + 航点索引归一化(1) = 13维
    - 隐藏层1：64神经元 + ReLU
    - 隐藏层2：32神经元 + ReLU
    - 输出层：2神经元（dx, dy调整量）
    """
    
    def __init__(self, input_dim: int = 13, hidden_dim1: int = 64, hidden_dim2: int = 32):
        """
        初始化神经网络模型
        
        Args:
            input_dim: 输入特征维度（默认13：多边形6 + 当前航点2 + 前一航点2 + 后一航点2 + 索引1）
            hidden_dim1: 第一隐藏层维度
            hidden_dim2: 第二隐藏层维度
        """
        super(PathOptimizer, self).__init__()
        
        self.input_dim = input_dim
        
        # 简单的3层MLP
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim1),
            nn.ReLU(),
            nn.Linear(hidden_dim1, hidden_dim2),
            nn.ReLU(),
            nn.Linear(hidden_dim2, 2)  # 输出 dx, dy 调整量
        )
        
        # 初始化权重（使用较小的值，避免大幅度调整）
        self._init_weights()
    
    def _init_weights(self):
        """初始化网络权重"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                nn.init.zeros_(m.bias)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        前向传播
        
        Args:
            x: 输入张量 shape (batch_size, input_dim)
            
        Returns:
            调整量张量 shape (batch_size, 2) - (dx, dy)
        """
        return self.network(x)
    
    def encode_polygon(self, polygon: Polygon) -> np.ndarray:
        """
        将多边形编码为特征向量
        
        编码内容：
        - 边界框: (min_x, min_y, max_x, max_y)
        - 中心点: (centroid_x, centroid_y)
        
        Args:
            polygon: Shapely多边形对象
            
        Returns:
            6维特征向量
        """
        minx, miny, maxx, maxy = polygon.bounds
        centroid = polygon.centroid
        
        # 归一化特征（相对于边界框大小）
        width = maxx - minx
        height = maxy - miny
        scale = max(width, height, 1e-6)  # 避免除零
        
        features = np.array([
            minx / scale,
            miny / scale,
            maxx / scale,
            maxy / scale,
            centroid.x / scale,
            centroid.y / scale
        ], dtype=np.float32)
        
        return features
    
    def encode_waypoint_context(
        self,
        current: Tuple[float, float],
        prev_waypoint: Optional[Tuple[float, float]],
        next_waypoint: Optional[Tuple[float, float]],
        polygon: Polygon,
        index: int,
        total: int
    ) -> np.ndarray:
        """
        编码航点上下文信息
        
        Args:
            current: 当前航点坐标 (x, y)
            prev_waypoint: 前一个航点（可能为None）
            next_waypoint: 后一个航点（可能为None）
            polygon: 多边形边界
            index: 当前航点索引
            total: 总航点数
            
        Returns:
            特征向量
        """
        minx, miny, maxx, maxy = polygon.bounds
        scale = max(maxx - minx, maxy - miny, 1e-6)
        
        # 当前航点（归一化）
        current_features = np.array([
            current[0] / scale,
            current[1] / scale
        ], dtype=np.float32)
        
        # 前一航点（不存在则用当前点）
        if prev_waypoint is not None:
            prev_features = np.array([
                prev_waypoint[0] / scale,
                prev_waypoint[1] / scale
            ], dtype=np.float32)
        else:
            prev_features = current_features.copy()
        
        # 后一航点（不存在则用当前点）
        if next_waypoint is not None:
            next_features = np.array([
                next_waypoint[0] / scale,
                next_waypoint[1] / scale
            ], dtype=np.float32)
        else:
            next_features = current_features.copy()
        
        # 航点索引（归一化到0-1）
        index_feature = np.array([index / max(total - 1, 1)], dtype=np.float32)
        
        return np.concatenate([
            current_features,
            prev_features,
            next_features,
            index_feature
        ])
    
    def optimize_waypoint(
        self,
        current: Tuple[float, float],
        prev_waypoint: Optional[Tuple[float, float]],
        next_waypoint: Optional[Tuple[float, float]],
        polygon: Polygon,
        index: int,
        total: int,
        adjustment_scale: float = 0.05
    ) -> Tuple[float, float]:
        """
        优化单个航点
        
        Args:
            current: 当前航点坐标
            prev_waypoint: 前一个航点
            next_waypoint: 后一个航点
            polygon: 多边形边界
            index: 当前航点索引
            total: 总航点数
            adjustment_scale: 调整量缩放因子（相对于多边形尺寸）
            
        Returns:
            优化后的航点坐标
        """
        # 编码特征
        polygon_features = self.encode_polygon(polygon)
        waypoint_features = self.encode_waypoint_context(
            current, prev_waypoint, next_waypoint, polygon, index, total
        )
        
        # 合并输入
        input_features = np.concatenate([polygon_features, waypoint_features])
        input_tensor = torch.from_numpy(input_features).unsqueeze(0)  # 添加batch维度
        
        # 预测调整量
        self.eval()
        with torch.no_grad():
            adjustment = self(input_tensor).squeeze(0).numpy()
        
        # 计算缩放后的调整量
        minx, miny, maxx, maxy = polygon.bounds
        scale = max(maxx - minx, maxy - miny, 1e-6)
        scaled_adjustment = adjustment * scale * adjustment_scale
        
        # 应用调整
        optimized_x = current[0] + float(scaled_adjustment[0])
        optimized_y = current[1] + float(scaled_adjustment[1])
        
        return (optimized_x, optimized_y)
    
    def save_model(self, path: Optional[str] = None) -> str:
        """
        保存模型权重
        
        Args:
            path: 保存路径（可选，默认保存在models目录）
            
        Returns:
            保存的文件路径
        """
        _ensure_models_dir()
        
        if path is None:
            path = str(MODELS_DIR / "path_optimizer.pth")
        
        torch.save({
            'model_state_dict': self.state_dict(),
            'input_dim': self.input_dim,
        }, path)
        
        return path
    
    def load_model(self, path: Optional[str] = None) -> None:
        """
        加载模型权重
        
        Args:
            path: 模型路径（可选，默认从models目录加载）
        """
        if path is None:
            path = str(MODELS_DIR / "path_optimizer.pth")
        
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        
        checkpoint = torch.load(path, map_location='cpu')
        self.load_state_dict(checkpoint['model_state_dict'])


def optimize_path(
    polygon: Polygon,
    initial_path: List[Tuple[float, float]],
    model: Optional[PathOptimizer] = None,
    adjustment_scale: float = 0.05,
    iterations: int = 1
) -> List[Tuple[float, float]]:
    """
    优化路径的主函数
    
    使用深度学习模型对初始路径进行优化，减少转弯次数和路径长度。
    MVP版本使用随机初始化权重，输出接近原始路径的调整结果。
    
    Args:
        polygon: 农田多边形边界
        initial_path: 初始路径航点列表 [(x1, y1), (x2, y2), ...]
        model: 预训练的PathOptimizer模型（可选，默认创建新模型）
        adjustment_scale: 调整量缩放因子
        iterations: 优化迭代次数
        
    Returns:
        优化后的航点列表
    """
    if len(initial_path) < 2:
        return initial_path.copy()
    
    # 创建或使用模型
    if model is None:
        model = PathOptimizer()
    model.eval()
    
    # 迭代优化
    current_path = list(initial_path)
    
    for _ in range(iterations):
        optimized_path = []
        total = len(current_path)
        
        for i, waypoint in enumerate(current_path):
            # 获取前后航点
            prev_wp = current_path[i - 1] if i > 0 else None
            next_wp = current_path[i + 1] if i < total - 1 else None
            
            # 优化当前航点
            optimized_wp = model.optimize_waypoint(
                current=waypoint,
                prev_waypoint=prev_wp,
                next_waypoint=next_wp,
                polygon=polygon,
                index=i,
                total=total,
                adjustment_scale=adjustment_scale
            )
            
            # 确保优化后的航点仍在多边形内
            from shapely.geometry import Point
            point = Point(optimized_wp)
            if polygon.contains(point) or polygon.touches(point):
                optimized_path.append(optimized_wp)
            else:
                # 如果优化后超出边界，保持原位置
                optimized_path.append(waypoint)
        
        current_path = optimized_path
    
    return current_path


# 保持向后兼容性的类（保留原有接口）
class DeepLearningModel(PathOptimizer):
    """
    深度学习路径规划模型
    
    向后兼容的类名，继承自PathOptimizer。
    """
    
    def __init__(self, input_dim: int = 13, hidden_dim: int = 64, output_dim: int = 2):
        """
        初始化神经网络模型
        
        Args:
            input_dim: 输入特征维度
            hidden_dim: 隐藏层维度
            output_dim: 输出维度（固定为2，用于dx, dy）
        """
        super().__init__(input_dim=input_dim, hidden_dim1=hidden_dim, hidden_dim2=hidden_dim // 2)
    
    def predict_next_waypoint(
        self,
        current_pos: Tuple[float, float],
        polygon: Polygon,
        history: List[Tuple[float, float]]
    ) -> Tuple[float, float]:
        """
        预测下一个航点
        
        Args:
            current_pos: 当前位置
            polygon: 农田多边形
            history: 历史航点列表
            
        Returns:
            预测的下一个航点坐标 (x, y)
        """
        # 获取前一航点
        prev_wp = history[-1] if history else None
        
        # 使用当前航点作为"下一航点"的占位
        optimized = self.optimize_waypoint(
            current=current_pos,
            prev_waypoint=prev_wp,
            next_waypoint=None,  # 待预测
            polygon=polygon,
            index=len(history),
            total=len(history) + 2,
            adjustment_scale=0.1  # 稍大的调整量用于预测
        )
        
        return optimized
    
    def train_step(self, batch: dict) -> float:
        """
        训练一步（MVP版本不支持训练）
        
        Args:
            batch: 训练批次数据
            
        Returns:
            损失值
        """
        raise NotImplementedError("MVP版本不支持训练，请使用预训练权重或实现训练逻辑")
    
    def save_model(self, path: Optional[str] = None) -> str:
        """保存模型"""
        return super().save_model(path)
    
    def load_model(self, path: Optional[str] = None) -> None:
        """加载模型"""
        super().load_model(path)


class ModelTrainer:
    """
    模型训练器（MVP版本占位符）
    
    管理模型训练流程，包括数据加载、训练循环和模型评估。
    MVP版本不实现训练功能，保留接口供后续扩展。
    """
    
    def __init__(self, model: PathOptimizer):
        """
        初始化训练器
        
        Args:
            model: 待训练的模型
        """
        self.model = model
        self.optimizer = None
        self.loss_fn = None
    
    def prepare_training_data(
        self,
        paths: List[List[Tuple[float, float]]],
        polygons: List[Polygon]
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        准备训练数据
        
        Args:
            paths: 历史路径列表
            polygons: 对应的多边形列表
            
        Returns:
            (特征数据, 标签数据)
        """
        raise NotImplementedError("MVP版本不支持训练数据准备")
    
    def train(
        self,
        epochs: int = 100,
        batch_size: int = 32,
        learning_rate: float = 0.001
    ) -> List[float]:
        """
        训练模型
        
        Args:
            epochs: 训练轮数
            batch_size: 批次大小
            learning_rate: 学习率
            
        Returns:
            每轮的损失值列表
        """
        raise NotImplementedError("MVP版本不支持训练，请使用预训练权重")
    
    def evaluate(self, test_data: Tuple[np.ndarray, np.ndarray]) -> float:
        """
        评估模型
        
        Args:
            test_data: 测试数据 (features, labels)
            
        Returns:
            平均损失
        """
        raise NotImplementedError("MVP版本不支持模型评估")