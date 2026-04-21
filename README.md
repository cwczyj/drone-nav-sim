# 农业无人机航线导航规划模拟系统

一个基于 FastAPI + React 的农业无人机航线导航规划模拟系统，支持用户认证、农田管理、航线规划和可视化功能。

## 功能特性

- 用户注册与登录（JWT认证）
- 农田管理（创建、编辑、删除）
- 农田地图可视化（Leaflet）
- 航线自动生成与优化（深度学习模型）
- 权限控制（用户只能管理自己的农田）
- 响应式UI设计

## 技术栈

### 后端
- **FastAPI**: Web框架
- **PyJWT**: JWT认证
- **Passlib**: 密码加密
- **Pydantic**: 数据验证
- **PyTorch**: 深度学习模型（航线优化）
- **Shapely**: 几何计算
- **NumPy/SciPy**: 数值计算

### 前端
- **React 19**: Web应用框架
- **Vite**: 构建工具
- **Ant Design**: UI组件库
- **React Router**: 路由管理
- **Leaflet**: 地图可视化
- **Axios**: HTTP客户端
- **TypeScript**: 类型安全

## 环境要求

- **Python**: 3.10+
- **Node.js**: 18.0+
- **npm**: 9.0+

## 安装与启动

### 方式一：一键启动（推荐）

```bash
python run_all.py
```

首次运行时选择 `y` 安装依赖，之后选择 `n` 即可启动服务。

启动后访问：
- 前端界面：http://localhost:5173
- 后端API：http://localhost:8000
- API文档：http://localhost:8000/docs

### 方式二：手动启动

#### 1. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

#### 2. 安装前端依赖

```bash
cd frontend-react
npm install
```

#### 3. 启动后端服务

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. 启动前端服务（新终端）

```bash
cd frontend-react
npm run dev
```

### 配置端口（可选）

如果需要修改后端端口，编辑 `frontend-react/.env` 文件：

```bash
VITE_API_PORT=8000
```

确保 `.env` 中的端口号与后端实际运行端口一致。

## 项目结构

```
drone-nav-sim/
├── backend/                    # 后端代码
│   ├── main.py                # FastAPI主应用
│   ├── models.py              # 数据模型
│   ├── auth.py                # 认证模块
│   ├── database.py            # 数据存储
│   ├── farmland.py            # 农田管理API
│   ├── path_planning/         # 航线规划模块
│   │   ├── geometry.py        # 几何计算
│   │   ├── optimizer.py       # 航线优化
│   │   ├── dl_model.py        # 深度学习模型
│   │   ├── cpp.py             # C++扩展接口
│   │   └── routes.py          # 航线API路由
│   ├── data/                  # 数据存储目录
│   │   ├── users.json         # 用户数据
│   │   └── farmlands.json     # 农田数据
│   └── requirements.txt       # 后端依赖
├── frontend-react/            # React前端代码
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── auth/          # 认证组件
│   │   │   └── path/          # 航线可视化组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API服务
│   │   ├── context/           # React Context
│   │   ├── hooks/             # 自定义Hooks
│   │   └── utils/             # 工具函数
│   ├── package.json           # 依赖配置
│   └── vite.config.ts         # Vite配置
├── run_all.py                 # 一键启动脚本
├── test_system.py             # 系统测试
└── README.md                  # 项目文档
```

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
   - 边界坐标（在地图上绘制或JSON格式输入）

#### 边界坐标格式示例

```json
[[30.6742, 104.0667], [30.6752, 104.0687], [30.6762, 104.0667], [30.6742, 104.0667]]
```

3. 可以对现有农田进行编辑或删除

### 航线规划

1. 选择农田后，系统自动生成航线
2. 可调整航线参数（喷洒宽度、飞行高度等）
3. 支持航线优化（基于深度学习模型）

### 农田可视化

1. 点击侧边栏的"农田可视化"
2. 所有农田将在地图上以多边形形式显示
3. 点击农田可查看详细信息

## API文档

启动后端服务后，访问 http://localhost:8000/docs 查看完整的API文档。

### 主要API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户退出 |
| `/api/auth/me` | GET | 获取当前用户信息 |
| `/api/farmlands` | GET | 获取农田列表 |
| `/api/farmlands` | POST | 创建农田 |
| `/api/farmlands/{id}` | PUT | 更新农田 |
| `/api/farmlands/{id}` | DELETE | 删除农田 |
| `/api/path/generate` | POST | 生成航线 |
| `/api/path/optimize` | POST | 优化航线 |

## 测试

```bash
# 运行系统测试
python test_system.py

# 运行前端测试
cd frontend-react
npm test
```

## 数据存储

系统使用**本地JSON文件存储**，数据保存在 `backend/data/` 目录下：
- `users.json` - 用户账户数据
- `farmlands.json` - 农田数据

数据会自动持久化到本地文件，重启服务后数据不会丢失。

## 注意事项

1. 本系统使用JSON文件存储，数据会持久化到本地文件
2. 默认JWT token有效期为24小时
3. 生产环境请修改 `backend/auth.py` 中的 `SECRET_KEY`
4. 建议使用HTTPS部署以确保安全性
5. 前端开发服务器默认运行在5173端口
6. 深度学习模型需要PyTorch支持，首次加载可能较慢

## 天地图 Token 配置

系统使用天地图（Tianditu）作为卫星影像底图服务。

1. 访问 http://console.tianditu.gov.cn 注册开发者账号
2. 创建应用，获取 API Token（免费）
3. 在 `frontend-react/.env` 中配置:
   ```bash
   VITE_TIANDITU_TOKEN=your_token_here
   ```

注意：Token 配置完成后，地图将显示山西右玉地区卫星影像。

## 开发指南

### 代码风格

- Python: 遵循PEP 8规范，使用4空格缩进
- TypeScript/React: 使用函数式组件和Hooks
- 提交信息: 使用约定式提交格式

### 分支管理

- `master`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支

## 许可证

MIT License