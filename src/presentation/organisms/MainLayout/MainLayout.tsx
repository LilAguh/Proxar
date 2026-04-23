import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Topbar } from '../Topbar/Topbar';
import './MainLayout.scss';

export const MainLayout = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-layout__content">
        <Topbar />
        <div className="main-layout__body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};