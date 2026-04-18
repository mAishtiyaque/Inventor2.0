import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import type { LedgerEntry } from '../../api/inventoryApi';
import { uiLoader } from '../../store/loaderStore';
import { uiAlert } from '../../store/alertStore';
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Search,
    Package
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const LedgerPage: React.FC = () => {
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadLedger();
    }, []);

    const loadLedger = async () => {
        uiLoader.show();
        try {
            const response = await inventoryApi.getLedger();
            setLedger(response.data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            uiAlert.error("Failed to load transaction history");
            console.error(error);
        } finally {
            uiLoader.hide();
        }
    };

    const filteredLedger = ledger.filter(entry =>
        entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <History size={32} className="text-slate-400" />
                        Transaction Log
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        Historical record of all inventory movements and cost adjustments.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-b-4 border-b-slate-900/10">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Package size={18} className="text-slate-400" />
                        Movement History
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inflow</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outflow</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Quantity</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Unit Cost</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Total Value</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Event Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLedger.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <p className="text-xs font-bold text-slate-900">
                                            {formatDate(entry.createdAt)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            {formatTime(entry.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-default">
                                            {entry.productName}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center">
                                            {entry.direction === 0 ? (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                                                    <ArrowUpCircle size={12} />
                                                    <span className="text-[10px] font-black border-transparent">IN</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                                                    <ArrowDownCircle size={12} />
                                                    <span className="text-[10px] font-black border-transparent">OUT</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <span className={cn(
                                            "font-black text-sm",
                                            entry.direction === 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {entry.direction === 0 ? '+' : '-'}{entry.quantity}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{entry.uom}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right font-bold text-slate-500 text-sm">
                                        ₹{entry.unitCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">
                                        ₹{(entry.quantity * entry.unitCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black tracking-widest uppercase border border-slate-200/50 text-nowrap">
                                                {entry.eventType.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLedger.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <History size={48} className="mb-4 opacity-20" />
                                            <p className="font-bold text-slate-500">No transactions found</p>
                                            <p className="text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
