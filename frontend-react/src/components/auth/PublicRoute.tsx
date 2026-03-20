import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

/**
 * PublicRoute - Redirects authenticated users to dashboard.
 * Use for login/register pages that should not be accessible when logged in.
 */
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}