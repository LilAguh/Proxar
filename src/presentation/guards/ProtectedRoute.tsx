import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, _hasHydrated, user } = useAuthStore();

  // Esperar a que se hidrate el store
  if (!_hasHydrated) {
    return null;
  }

  // No autenticado → redirect a login
  if (!isAuthenticated()) {
    console.log('Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Requiere admin pero no lo es → redirect a home
  if (requireAdmin && !isAdmin()) {
    console.log('Requires admin but user is not admin:', { requireAdmin, isAdmin: isAdmin(), userRole: user?.role });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};