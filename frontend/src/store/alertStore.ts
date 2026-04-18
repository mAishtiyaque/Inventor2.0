import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertState {
  alerts: Alert[];
  addAlert: (message: string, type: AlertType) => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      alerts: [...state.alerts, { id, type, message }]
    }));
    setTimeout(() => {
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id)
      }));
    }, 5000);
  },
  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id)
  }))
}));

export const uiAlert = {
  success: (msg: string) => useAlertStore.getState().addAlert(msg, 'success'),
  error: (msg: string) => useAlertStore.getState().addAlert(msg, 'error'),
  warning: (msg: string) => useAlertStore.getState().addAlert(msg, 'warning'),
  info: (msg: string) => useAlertStore.getState().addAlert(msg, 'info'),
};
