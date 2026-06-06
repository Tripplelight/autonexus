import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function DealerProtectedRoute() {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!['DEALER', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
