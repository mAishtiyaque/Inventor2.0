import React from 'react';
import { Sidebar } from './Sidebar';
import { Bell } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white shadow-[-1px_0_0_0_rgba(0,0,0,0.05)]">
                <header className="h-14 border-b border-slate-200 flex items-center px-8 justify-between bg-white/80 backdrop-blur sticky top-0 z-10">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Global Space
                        <select name='tenant-select' onChange={(e) => localStorage.setItem('tenantId', e.target.value)}>
                            <option value="tenant-1">Tenant 1</option>
                            <option value="tenant-2">Tenant 2</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="text-xs font-bold text-slate-400 tracking-wide">{today}</span>
                        <button className="relative p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-slate-50/20">
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto h-full px-0 sm:px-4 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
