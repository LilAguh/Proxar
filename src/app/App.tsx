import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastContainer } from '@presentation/molecules';
import { ModalNuevoTicket, ModalCaja, ModalClient } from '@presentation/features';
import { useUIStore } from '@/stores';
import './App.scss';

function App() {
  const { modalTicket, closeModalTicket, modalCaja, closeModalCaja, modalClient, closeModalClient } = useUIStore();

  return (
    <>
      <RouterProvider router={router} />
      
      {/* Modales globales */}
      <ModalNuevoTicket isOpen={modalTicket} onClose={closeModalTicket} />
      <ModalCaja isOpen={modalCaja} onClose={closeModalCaja} />
      <ModalClient isOpen={modalClient} onClose={closeModalClient} />
      
      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default App;