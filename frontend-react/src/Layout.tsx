import { Outlet, Link, useNavigate } from 'react-router';
import { useAuth } from './hooks/useAuth';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <nav>
        <ul>
          {!isAuthenticated ? (
            <>
              <li><Link to="/login">登录</Link></li>
              <li><Link to="/register">注册</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">首页</Link></li>
              <li><Link to="/farmlands">农田管理</Link></li>
              <li><Link to="/path-planning">航线规划</Link></li>
              <li><button onClick={handleLogout}>退出</button></li>
            </>
          )}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}