#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

print("=== 系统测试脚本 ===")
print()

# 测试1: 检查后端依赖
print("测试1: 检查后端依赖...")
try:
    import fastapi
    import uvicorn
    import pydantic
    import jose
    import passlib
    print("✅ 后端依赖安装正常")
except ImportError as e:
    print(f"❌ 后端依赖缺失: {e}")
    sys.exit(1)

print()

# 测试2: 检查前端依赖
print("测试2: 检查前端依赖...")
print("✅ 前端使用 React，请确保已运行 'cd frontend-react && npm install'")

print()

# 测试3: 测试后端模块导入
print("测试3: 测试后端模块...")
try:
    from models import User, Farmland, FarmlandCreate
    from auth import get_password_hash, verify_password, create_access_token
    from database import create_user, get_user_by_username
    print("✅ 后端模块导入正常")
except Exception as e:
    print(f"❌ 后端模块导入失败: {e}")
    sys.exit(1)

print()

# 测试4: 测试密码哈希
print("测试4: 测试密码哈希...")
try:
    test_password = "test123456"
    hashed = get_password_hash(test_password)
    if verify_password(test_password, hashed):
        print("✅ 密码哈希验证正常")
    else:
        print("❌ 密码哈希验证失败")
        sys.exit(1)
except Exception as e:
    print(f"❌ 密码哈希测试失败: {e}")
    sys.exit(1)

print()

# 测试5: 测试JWT token生成
print("测试5: 测试JWT token生成...")
try:
    token = create_access_token(data={"sub": "testuser", "user_id": "test123"})
    if token and len(token) > 0:
        print("✅ JWT token生成正常")
    else:
        print("❌ JWT token生成失败")
        sys.exit(1)
except Exception as e:
    print(f"❌ JWT token生成失败: {e}")
    sys.exit(1)

print()

# 测试6: 测试数据模型
print("测试6: 测试数据模型...")
try:
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("password123")
    )
    
    farmland_create = FarmlandCreate(
        name="测试农田",
        area=10.5,
        crop_type="水稻",
        boundary_coords=[[30.6742, 104.0667], [30.6752, 104.0687], [30.6762, 104.0667]]
    )
    
    print("✅ 数据模型测试正常")
except Exception as e:
    print(f"❌ 数据模型测试失败: {e}")
    sys.exit(1)

print()

# 测试7: 测试数据库操作
print("测试7: 测试数据库操作...")
try:
    create_user(user)
    retrieved_user = get_user_by_username("testuser")
    
    if retrieved_user and retrieved_user.username == "testuser":
        print("✅ 数据库操作测试正常")
    else:
        print("❌ 数据库操作测试失败")
        sys.exit(1)
except Exception as e:
    print(f"❌ 数据库操作测试失败: {e}")
    sys.exit(1)

print()
print("=" * 40)
print("所有测试通过！系统准备就绪。")
print("=" * 40)
print()
print("运行以下命令启动系统:")
print("  python run_all.py")
print()
