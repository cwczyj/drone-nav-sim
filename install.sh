#!/bin/bash

echo "=== 农业无人机航线导航规划模拟系统 - 依赖安装脚本 ==="
echo ""

# 安装后端依赖
echo "正在安装后端依赖..."
cd backend
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

echo "✅ 后端依赖安装成功"
echo ""

# 安装前端依赖
echo "正在安装前端依赖..."
cd ../frontend-react
npm install

if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

echo "✅ 前端依赖安装成功"
echo ""

echo "=== 依赖安装完成 ==="
echo ""
echo "现在可以运行: python run_all.py"