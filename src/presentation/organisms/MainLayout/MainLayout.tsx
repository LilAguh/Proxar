import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Topbar } from '../Topbar/Topbar';
import { ToastContainer } from '@presentation/molecules';
import { ModalNuevoTicket, ModalCaja, ModalClient } from '@presentation/features';
import { useUIStore } from '@/stores';
import './MainLayout.scss';

export const MainLayout = () => {
  const { modalTicket, closeModalTicket, modalCaja, closeModalCaja, modalClient, closeModalClient } = useUIStore();

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-layout__content">
        <Topbar />
        <div className="main-layout__body">
          <Outlet />
        </div>
      </main>

      <ModalNuevoTicket isOpen={modalTicket} onClose={closeModalTicket} />
      <ModalCaja isOpen={modalCaja} onClose={closeModalCaja} />
      <ModalClient isOpen={modalClient} onClose={closeModalClient} />
      <ToastContainer />
    </div>
  );
};