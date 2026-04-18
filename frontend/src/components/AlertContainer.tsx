import React from 'react';
import { useAlertStore } from '../store/alertStore';

export const AlertContainer: React.FC = () => {
    const { alerts, removeAlert } = useAlertStore();

    return (
        <div className="fixed top-4 right-4 z-[70] flex flex-col gap-3 w-full max-w-sm">
            {alerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`px-4 py-3 rounded-lg shadow-lg border-l-4 flex items-center justify-between transform transition-all animate-in slide-in-from-right duration-300 ${alert.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                            alert.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' :
                                alert.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                                    'bg-blue-50 border-blue-500 text-blue-800'
                        }`}
                >
                    <p className="text-sm font-medium">{alert.message}</p>
                    <button
                        onClick={() => removeAlert(alert.id)}
                        className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};
