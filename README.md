# 农业无人机航线导航规划模拟系统

一个基于 FastAPI + Streamlit 的农业无人机航线导航规划模拟系统，支持用户认证、农田管理和可视化功能。

## 功能特性

- ✅ 用户注册与登录（JWT认证）
- ✅ 农田管理（创建、编辑、删除）
- ✅ 农田地图可视化（Folium）
- ✅ 权限控制（用户只能管理自己的农田）
- ✅ 响应式UI设计

## 技术栈

### 后端
- **FastAPI**: Web框架
- **PyJWT**: JWT认证
- **Passlib**: 密码加密
- **Pydantic**: 数据验证

### 前端
- **Streamlit**: Web应用框架
- **Folium**: 地图可视化
- **Requests**: HTTP客户端

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
pip install -r requirements.txt
```

### 2. 启动后端服务

```bash
cd backend
uvicorn main:app --reload
```

后端服务将在 http://localhost:8000 启动

### 3. 启动前端服务

```bash
cd frontend
streamlit run app.py
```

前端服务将在 http://localhost:8501 启动

### 4. 一键启动（推荐）

```bash
python run_all.py
```

首次运行时选择 `y` 安装依赖，之后选择 `n` 即可启动服务。

## 使用说明

### 用户注册与登录

1. 访问 http://localhost:8501
2. 点击"注册"标签，填写用户名、邮箱和密码
3. 注册完成后，切换到"登录"标签进行登录

### 农田管理

1. 登录后，在侧边栏选择"农田管理"
2. 点击"创建新农田"，填写农田信息：
   - 农田名称
   - 面积（单位：亩）
   - 作物类型
   - 边界坐标（JSON格式）

#### 边界坐标格式示例

```
[[30.6742, 104.0667], [30.6752, 104.0687], [30.6762, 104.0667], [30.6742, 104.0667]]
```

3. 可以对现有农田进行编辑或删除

### 农田可视化

1. 在侧边栏选择"农田可视化"
2. 所有农田将在地图上以多边形形式显示
3. 点击农田可查看详细信息
4. 右侧显示农田统计信息

## API文档

启动后端服务后，访问 http://localhost:8000/docs 查看完整的API文档。

### 主要API端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户退出
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/farmlands` - 获取农田列表
- `POST /api/farmlands` - 创建农田
- `PUT /api/farmlands/{id}` - 更新农田
- `DELETE /api/farmlands/{id}` - 删除农田

## 数据存储

系统使用**本地JSON文件存储**，数据保存在 `backend/data/` 目录下：
- `users.json` - 用户账户数据
- `farmlands.json` - 农田数据

数据会自动持久化到本地文件，重启服务后数据不会丢失。

## 项目结构

```
drone-nav-sim/
├── backend/                 # 后端代码
│   ├── main.py             # FastAPI主应用
│   ├── models.py           # 数据模型
│   ├── auth.py             # 认证模块
│   ├── farmland.py         # 农田管理API
│   ├── database.py         # 数据存储（内存）
│   └── requirements.txt    # 后端依赖
├── frontend/               # 前端代码
│   ├── app.py              # Streamlit主应用
│   ├── config.py           # 配置文件
│   ├── auth_state.py       # 认证状态管理
│   ├── pages/              # 页面组件
│   │   ├── login.py        # 登录/注册页面
│   │   ├── farmland_list.py# 农田管理页面
│   │   └── visualization.py# 可视化页面
│   └── requirements.txt    # 前端依赖
├── run_all.py              # 一键启动脚本
└── README.md               # 项目文档
```

## 注意事项

1. 本系统使用内存存储，重启后数据会丢失
2. 默认JWT token有效期为24小时
3. 生产环境请修改 `SECRET_KEY`
4. 建议使用HTTPS部署以确保安全性

## 后续扩展

- [ ] 数据库集成（SQLite/PostgreSQL）
- [ ] 航线自动生成功能
- [ ] 飞行记录管理
- [ ] 多语言支持
- [ ] 数据导出功能

## 许可证

MIT License
