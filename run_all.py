#!/usr/bin/env python3
import os
import sys
import subprocess
import threading
import time

def install_dependencies():
    print("正在安装依赖...")
    os.chdir(os.path.join(os.path.dirname(__file__), "backend"))
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

    os.chdir(os.path.join(os.path.dirname(__file__), "frontend-react"))
    subprocess.run(["npm", "install"], check=True)

    print("依赖安装完成！")

def run_backend():
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    os.chdir(backend_dir)
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])

def run_frontend():
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend-react")
    os.chdir(frontend_dir)
    subprocess.run(["npm", "run", "dev", "--", "--host"])

def main():
    print("=== 农业无人机航线导航规划模拟系统 ===")
    print()

    choice = input("是否首次运行？(y/n): ").lower()
    if choice == 'y':
        install_dependencies()

    print("\n正在启动服务...")
    print("后端服务: http://localhost:8000")
    print("前端服务: http://localhost:5173")
    print("\n按 Ctrl+C 停止服务\n")

    time.sleep(2)

    backend_thread = threading.Thread(target=run_backend)
    frontend_thread = threading.Thread(target=run_frontend)

    backend_thread.daemon = True
    frontend_thread.daemon = True

    backend_thread.start()
    time.sleep(3)
    frontend_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n正在停止服务...")
        print("服务已停止")

if __name__ == "__main__":
    main()
