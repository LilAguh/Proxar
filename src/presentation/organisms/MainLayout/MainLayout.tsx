import { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Topbar } from '../Topbar/Topbar';
import './MainLayout.scss';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-layout__content">
        <Topbar />
        <div className="main-layout__body">{children}</div>
      </main>
    </div>
  );
};