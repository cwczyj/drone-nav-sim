@echo off
chcp 65001 > nul
echo === 农业无人机航线导航规划模拟系统 - 依赖安装脚本 ===
echo.

REM 安装后端依赖
echo 正在安装后端依赖...
cd backend
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 后端依赖安装成功
echo.

REM 安装前端依赖
echo 正在安装前端依赖...
cd ..\frontend
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)

echo ✅ 前端依赖安装成功
echo.

echo === 依赖安装完成 ===
echo.
echo 现在可以运行: python run_all.py
pause
