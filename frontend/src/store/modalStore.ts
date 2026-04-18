import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
  open: (type: string, data?: any) => void;
  close: () => void;
}

export const useModal = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  open: (type: string, data: any = null) => set({ isOpen: true, type, data }),
  close: () => set({ isOpen: false, type: null, data: null }),
}));
