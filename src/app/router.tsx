import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@presentation/organisms';
import { ProtectedRoute } from '@presentation/guards/ProtectedRoute';
import { Dashboard } from '@presentation/pages/Dashboard/Dashboard';
import { Tickets } from '@presentation/pages/Tickets/Tickets';
import { Caja } from '@presentation/pages/Caja/Caja';
import { Clients } from '@presentation/pages/Clients/Clients';
import { Users } from '@presentation/pages/Users/Users';
import { Login } from '@presentation/pages/Login/Login';

export const router = createBrowserRouter([
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
        path: 'clientes',
        element: <Clients />,
      },
      {
        path: 'caja',
        element: <Caja />,
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