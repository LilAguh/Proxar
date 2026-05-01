import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@presentation/organisms';
import { ProtectedRoute } from '@presentation/guards/ProtectedRoute';
import { PageTransition } from '@presentation/components/PageTransition/PageTransition';
import { Dashboard } from '@presentation/pages/Dashboard/Dashboard';
import { Tickets } from '@presentation/pages/Tickets/Tickets';
import { Caja } from '@presentation/pages/Caja/Caja';
import { Clients } from '@presentation/pages/Clients/Clients';
import { Users } from '@presentation/pages/Users/Users';
import { Saldo } from '@presentation/pages/Saldo/Saldo';
import { Reports } from '@presentation/pages/Reports';
import { Login } from '@presentation/pages/Login/Login';
import { CompanyLogin } from '@presentation/pages/CompanyLogin/CompanyLogin';
import { CompanyRegister } from '@presentation/pages/CompanyRegister/CompanyRegister';

const pt = (element: React.ReactElement) => (
  <PageTransition>{element}</PageTransition>
);

export const router = createBrowserRouter([
  {
    path: '/company',
    element: <Navigate to="/company/login" replace />,
  },
  {
    path: '/company/login',
    element: pt(<CompanyLogin />),
  },
  {
    path: '/company/register',
    element: pt(<CompanyRegister />),
  },
  {
    path: '/login',
    element: pt(<Login />),
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
        element: pt(<Dashboard />),
      },
      {
        path: 'tickets',
        element: pt(<Tickets />),
      },
      {
        path: 'caja',
        element: pt(<Caja />),
      },
      {
        path: 'saldo',
        element: pt(<Saldo />),
      },
      {
        path: 'reports',
        element: pt(<Reports />),
      },
      {
        path: 'clients',
        element: pt(<Clients />),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            {pt(<Users />)}
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
