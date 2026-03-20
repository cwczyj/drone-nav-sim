import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, theme } from 'antd';
import {
  HomeOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from './hooks/useAuth';

const { Sider, Header, Content } = AntLayout;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/farmlands',
      icon: <EnvironmentOutlined />,
      label: <Link to="/farmlands">农田管理</Link>,
    },
    {
      key: '/path-planning',
      icon: <RocketOutlined />,
      label: <Link to="/path-planning">航线规划</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出',
      onClick: handleLogout,
    },
  ];

  const selectedKeys = [location.pathname];

  if (!isAuthenticated) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: colorBgContainer,
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#52c41a' }}>
            农业无人机导航规划系统
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button type="text" onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </div>
        </Header>
        <Content style={{ padding: '24px', background: colorBgContainer }}>
          <Outlet />
        </Content>
      </AntLayout>
    );
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width="200"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: collapsed ? '0 8px' : '0 16px',
          }}
        >
          {collapsed ? (
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              无人机
            </div>
          ) : (
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#fff',
                textAlign: 'center',
              }}
            >
              农业无人机导航规划系统
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{
            borderRight: 0,
          }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 64,
              height: 64,
            }}
          />
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#52c41a' }}>
            农业无人机导航规划系统
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}