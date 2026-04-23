import { create } from 'zustand';

interface UIStore {
  // Modals
  modalTicket: boolean;
  modalCaja: boolean;
  modalClient: boolean;
  
  // Sidebar
  sidebarCollapsed: boolean;
  
  // Actions
  openModalTicket: () => void;
  closeModalTicket: () => void;
  openModalCaja: () => void;
  closeModalCaja: () => void;
  openModalClient: () => void;
  closeModalClient: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  modalTicket: false,
  modalCaja: false,
  modalClient: false,
  sidebarCollapsed: false,

  openModalTicket: () => set({ modalTicket: true }),
  closeModalTicket: () => set({ modalTicket: false }),
  openModalCaja: () => set({ modalCaja: true }),
  closeModalCaja: () => set({ modalCaja: false }),
  openModalClient: () => set({ modalClient: true }),
  closeModalClient: () => set({ modalClient: false }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));