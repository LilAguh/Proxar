import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@presentation/organisms';
import { ProtectedRoute } from '@presentation/guards/ProtectedRoute';
import { Dashboard } from '@presentation/pages/Dashboard/Dashboard';
import { Tickets } from '@presentation/pages/Tickets/Tickets';
import { Caja } from '@presentation/pages/Caja/Caja';
import { Clients } from '@presentation/pages/Clients/Clients';
import { Users } from '@presentation/pages/Users/Users';
import { Login } from '@presentation/pages/Login/Login';
import { CompanyLogin } from '@presentation/pages/CompanyLogin/CompanyLogin';
import { CompanyRegister } from '@presentation/pages/CompanyRegister/CompanyRegister';

export const router = createBrowserRouter([
  {
    path: '/company',
    element: <CompanyLogin />,
  },
  {
    path: '/company/register',
    element: <CompanyRegister />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'tickets',
        element: <Tickets />,
      },
      {
        path: 'caja',
        element: <Caja />,
      },
      {
        path: 'clients', // ← ACTIVAR
        element: <Clients />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);