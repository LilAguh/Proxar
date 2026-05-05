import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useCompanyStore } from '@/stores/useCompanyStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, _hasHydrated: authHydrated, logout } = useAuthStore();
  const { hasCompany, _hasHydrated: companyHydrated, clearCompany } = useCompanyStore();

  // Esperar a que se hidraten ambos stores
  if (!authHydrated || !companyHydrated) {
    return null;
  }

  // 1. Verificar autenticación de empleado
  if (!isAuthenticated()) {
    return <Navigate to={hasCompany() ? '/login' : '/company/login'} replace />;
  }

  // 2. Si hay sesión activa pero falta empresa → estado inconsistente
  // Puede pasar si el usuario manipula localStorage y borra proxar-company
  // Limpiamos la sesión completa y redirigimos
  if (!hasCompany()) {
    console.warn('Inconsistent state: authenticated user without company. Logging out.');
    logout();
    clearCompany();
    return <Navigate to="/company/login" replace />;
  }

  // 3. Requiere admin pero no lo es → redirect a home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
