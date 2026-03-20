
## Layout.tsx Redesign - Ant Design Layout (2026-03-20)

### Success Pattern: Ant Design Layout with Sider Navigation

**Key Implementation Details:**

1. **Import Alias for Layout Component**
   - When component function is named `Layout`, import Ant Design Layout as alias: `import { Layout as AntLayout } from 'antd'`
   - Destructure sub-components: `const { Sider, Header, Content } = AntLayout`

2. **Menu Configuration**
   - Use `items` array with `key`, `icon`, `label`, and optional `onClick` properties
   - Active menu item tracked via `selectedKeys={[location.pathname]}`
   - Menu items with `Link` components for navigation: `label: <Link to="/path">Label</Link>`

3. **Responsive Sider**
   - `breakpoint="lg"` - automatically collapses on mobile
   - `collapsedWidth="80"` and `width="200"` for expanded/collapsed sizes
   - `position: fixed` for Sider to maintain position during scroll
   - Toggle button in Header using `MenuFoldOutlined` / `MenuUnfoldOutlined` icons

4. **Theme Integration**
   - Use `theme.useToken()` to access design tokens: `colorBgContainer`, `borderRadiusLG`
   - Green primary color (#52c41a) automatically applied via ConfigProvider in main.tsx

5. **Authentication-Based Rendering**
   - Unauthenticated: Simple header with login/register buttons
   - Authenticated: Full layout with Sider navigation, collapsible sidebar

6. **Required Icons from @ant-design/icons**
   - `HomeOutlined` - 首页
   - `EnvironmentOutlined` - 农田管理
   - `RocketOutlined` - 航线规划
   - `LogoutOutlined` - 退出
   - `MenuFoldOutlined` / `MenuUnfoldOutlined` - Sidebar toggle

### Files Modified
- `frontend-react/src/Layout.tsx` - Complete redesign with Ant Design components

### Build Verification
- `npm run build` passes successfully
