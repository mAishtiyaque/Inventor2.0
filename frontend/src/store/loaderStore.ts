import { create } from 'zustand';

interface LoaderState {
  isLoading: boolean;
  refCount: number;
  show: () => void;
  hide: () => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  refCount: 0,
  show: () => set((state) => ({ 
    refCount: state.refCount + 1, 
    isLoading: true 
  })),
  hide: () => set((state) => {
    const nextCount = Math.max(0, state.refCount - 1);
    return {
      refCount: nextCount,
      isLoading: nextCount > 0
    };
  })
}));

export const uiLoader = {
  show: () => useLoaderStore.getState().show(),
  hide: () => useLoaderStore.getState().hide()
};
