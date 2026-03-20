# ECharts 拖拽编辑器 - 快速入门指南

## 🎯 实现总结

我已经为你创建了一个基于 **ECharts** 的可拖拽农田编辑器，这是实现真正拖拽功能的最佳方案！

## ✨ 新增文件

```
frontend/
├── components/
│   ├── __init__.py                      # 组件模块初始化
│   ├── echarts_editor.py                # ECharts 编辑器实现
│   └── README.md                        # 详细使用文档
└── pages/
    └── farmland_list.py                 # 已集成编辑器选择器
```

## 🚀 快速开始

### 1. 启动应用

```bash
cd frontend && streamlit run app.py --server.port 8501
```

### 2. 选择编辑器类型

在"农田管理"页面，创建新农田时，你会看到编辑器类型选择：

```
🎨 选择编辑器类型
○ Plotly（基础）
● ECharts（支持拖拽）  ← 选择这个！
```

### 3. 拖拽编辑

1. 选择预设形状或手动绘制
2. 在 ECharts 编辑器中，会显示蓝色的多边形
3. 将鼠标悬停在顶点上（顶点会变成红色）
4. **按住鼠标左键拖拽顶点到新位置**
5. 坐标会实时更新！

## 📊 方案对比

| 特性 | Plotly | ECharts |
|------|--------|---------|
| **拖拽顶点** | ❌ 不支持 | ✅ **支持** |
| **拖拽整个多边形** | ❌ 不支持 | ❌ 不支持（未来可能支持） |
| **性能** | ⚡ 快速 | ⚡⚡ 更快 |
| **学习曲线** | 低 | 低 |
| **坐标精确度** | 高 | 高 |
| **实时反馈** | 中 | **高** |
| **浏览器兼容** | 好 | 好 |

## 🎨 用户界面

### ECharts 编辑器特性

```
┌─────────────────────────────────────┐
│   🖌️ 农田编辑器（ECharts - 支持拖拽）│
│   💡 直接拖拽多边形顶点来修改形状     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                     │
│   Y 坐标 (米)                        │
│     ↑                               │
│     │  ┌─────┐                       │
│     │  │  ●  │  ← 可拖拽的顶点       │
│     │  ●     ●                      │
│     │  ╲     ╱                      │
│     │   ╲   ╱                       │
│     │    ╲ ╱                        │
│     │     ●                          │
│     │                                │
│     └───────────────────────→ X 坐标  │
│                                     │
└─────────────────────────────────────┘
```

### 操作提示

- **蓝色多边形**: 新农田（可编辑）
- **绿色/黄色等多边形**: 现有农田（仅显示）
- **白色圆圈**: 可拖拽的顶点
- **红色圆圈**: 鼠标悬停状态（可拖拽）

## 🔧 技术实现

### 关键代码

```python
# 在 farmland_list.py 中
from components.echarts_editor import create_echarts_editor

# 创建编辑器
updated_coords = create_echarts_editor(
    existing_farmlands=existing_farmlands,
    new_coords=current_coords,
    key="farm_editor"
)

# 更新坐标
if updated_coords:
    st.session_state.new_polygon_coords = updated_coords
```

### 工作原理

1. **ECharts 渲染**
   - 使用 CDN 加载 ECharts 5.4.3
   - 绘制多边形和可拖拽顶点
   - 设置 `draggable: true` 属性

2. **拖拽事件监听**
   ```javascript
   onDrag: function(params) {
       // 更新坐标
       newCoords[idx] = [params.value[0], params.value[1]];
       // 实时更新图表
       myChart.setOption({...});
       // 同步到 Streamlit
       inputEl.value = JSON.stringify(newCoords);
   }
   ```

3. **Streamlit 集成**
   - 使用隐藏的 text_input 传递坐标
   - 通过 `st.session_state` 存储更新
   - 自动触发重新渲染

## 💡 使用技巧

### 1. 精确调整

```
1. 先用拖拽快速调整到大致位置
2. 再用坐标编辑区域精确微调
3. 点击"应用坐标"确认
```

### 2. 避免重叠

```
1. 拖拽时注意观察与其他农田的重叠
2. 使用"重叠检测"功能验证
3. 如有重叠，系统会提示并自动调整
```

### 3. 快速移动

```
如果需要整体移动农田：
1. 使用"方向控制"按钮
2. 或在坐标编辑中批量修改
```

## 🐛 故障排除

### 问题：编辑器显示空白

**可能原因**：
- CDN 加载失败
- 网络连接问题

**解决方案**：
1. 检查网络连接
2. 打开浏览器控制台（F12）查看错误
3. 刷新页面

### 问题：拖拽后坐标未更新

**可能原因**：
- key 参数冲突
- JavaScript 错误

**解决方案**：
1. 清除 Streamlit 缓存：`Ctrl + C` 重新启动
2. 检查浏览器控制台错误
3. 确认 `key` 参数唯一

### 问题：顶点无法拖拽

**可能原因**：
- 未悬停在顶点上
- 其他元素遮挡

**解决方案**：
1. 将鼠标移动到白色圆圈上（会变成红色）
2. 按住鼠标左键拖拽
3. 检查是否有弹窗或警告框遮挡

## 🎓 为什么选择 ECharts？

### 优势

1. **原生拖拽支持**
   - ECharts 内置 draggable 属性
   - 无需额外的 JavaScript 框架
   - 性能优异

2. **良好的文档**
   - 丰富的示例和文档
   - 活跃的社区支持
   - 持续的更新维护

3. **易于集成**
   - 通过 CDN 加载
   - 与 Streamlit 无缝集成
   - 学习曲线平缓

4. **跨浏览器兼容**
   - 支持所有现代浏览器
   - 移动端良好支持
   - 无需额外 polyfill

## 🚀 未来扩展

### 计划中的功能

- [ ] **多边形整体拖拽**
  - 拖拽多边形内部移动整个形状
  
- [ ] **添加/删除顶点**
  - 双击边线添加顶点
  - 右键顶点删除

- [ ] **网格吸附**
  - 按住 Shift 键吸附到网格
  - 便于精确对齐

- [ ] **旋转和镜像**
  - 围绕中心点旋转
  - 水平/垂直镜像

- [ ] **撤销/重做**
  - 保存操作历史
  - 支持快捷键（Ctrl+Z/Ctrl+Y）

## 📚 参考资源

- [ECharts 官方文档](https://echarts.apache.org/zh/index.html)
- [ECharts 拖拽示例](https://echarts.apache.org/examples/zh/editor.html?c=line-draggable)
- [Streamlit Components](https://docs.streamlit.io/library/components)
- [本项目 ECharts 文档](./frontend/components/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### v1.0.0 (2026-01-26)
- ✅ 初始版本
- ✅ 支持顶点拖拽
- ✅ 实时坐标更新
- ✅ Streamlit 集成
- ✅ 现有农田显示

---

**享受拖拽编辑的便利！** 🎉
