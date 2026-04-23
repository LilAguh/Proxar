import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@presentation/organisms';
import { Dashboard } from '@presentation/pages/Dashboard/Dashboard';
import { Tickets } from '@presentation/pages/Tickets/Tickets';
import { Caja } from '@presentation/pages/Caja/Caja';
import { Clients } from '@presentation/pages/Clients/Clients';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);