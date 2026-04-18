import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import type { LedgerEntry } from '../api/inventoryApi';
import { uiLoader } from '../store/loaderStore';

export const InventoryLedgerView: React.FC = () => {
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);

    useEffect(() => {
        loadLedger();
    }, []);

    const loadLedger = async () => {
        uiLoader.show();
        try {
            const response = await inventoryApi.getLedger();
            setLedger(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Qty</th>
                            <th className="px-6 py-3">Cost</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ledger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{entry.productName}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${entry.direction === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {entry.direction}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{entry.quantity} {entry.uom}</td>
                                <td className="px-6 py-4 text-slate-900 font-medium">${entry.unitCost.toFixed(2)}</td>
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
