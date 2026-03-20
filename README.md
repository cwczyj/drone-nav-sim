# 农业无人机航线导航规划模拟系统

一个基于 FastAPI + React 的农业无人机航线导航规划模拟系统，支持用户认证、农田管理和可视化功能。

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
- **React**: Web应用框架
- **Vite**: 构建工具
- **Ant Design**: UI组件库
- **React Router**: 路由管理
- **Axios**: HTTP客户端

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt

cd ../frontend-react
npm install
```

### 2. 配置端口（可选）

如果后端运行在非默认端口（默认 8000），需要修改前端配置：

```bash
# 编辑 frontend-react/.env 文件
VITE_API_PORT=8001  # 修改为后端实际运行的端口号
```

**注意：** 只需修改 `.env` 文件中的 `VITE_API_PORT` 值，前端会自动同步配置。

### 3. 启动后端服务

```bash
cd backend
uvicorn main:app --reload --port 8001  # 指定端口号（默认 8000）
```

后端服务将在 http://localhost:8001 启动

### 4. 启动前端服务

```bash
cd frontend-react
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 5. 一键启动（推荐）

```bash
python run_all.py
```

首次运行时选择 `y` 安装依赖，之后选择 `n` 即可启动服务。

## 使用说明

### 用户注册与登录

1. 访问 http://localhost:5173
2. 点击"注册"标签，填写用户名、邮箱和密码
3. 注册完成后，切换到"登录"标签进行登录

### 农田管理

1. 登录后，点击侧边栏的"农田管理"
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

1. 点击侧边栏的"农田可视化"
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
├── frontend-react/         # React前端代码
│   ├── src/                # 源代码
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   └── App.tsx         # 主应用组件
│   ├── package.json        # 依赖配置
│   └── vite.config.ts      # Vite配置
├── run_all.py              # 一键启动脚本
└── README.md               # 项目文档
```

## 注意事项

1. 本系统使用JSON文件存储，数据会持久化到本地文件
2. 默认JWT token有效期为24小时
3. 生产环境请修改 `SECRET_KEY`
4. 建议使用HTTPS部署以确保安全性
5. React开发服务器默认运行在5173端口

## 后续扩展

- [ ] 数据库集成（SQLite/PostgreSQL）
- [ ] 航线自动生成功能
- [ ] 飞行记录管理
- [ ] 多语言支持
- [ ] 数据导出功能

## 许可证

MIT License
