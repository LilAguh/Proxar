import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useCompanyStore } from '@/stores/useCompanyStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, _hasHydrated: authHydrated, user } = useAuthStore();
  const { hasCompany, _hasHydrated: companyHydrated } = useCompanyStore();

  // Esperar a que se hidraten ambos stores
  if (!authHydrated || !companyHydrated) {
    return null;
  }

  // 1. Verificar company primero
  if (!hasCompany()) {
    console.log('No company selected');
    return <Navigate to="/company/login" replace />;
  }

  // 2. Verificar autenticación de empleado
  if (!isAuthenticated()) {
    console.log('Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // 3. Requiere admin pero no lo es → redirect a home
  if (requireAdmin && !isAdmin()) {
    console.log('Requires admin but user is not admin:', { requireAdmin, isAdmin: isAdmin(), userRole: user?.role });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
