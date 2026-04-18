import React, { useState } from 'react';
import { productsApi, CostTypeLabel } from '../api/productsApi';
import type { CostType } from '../api/productsApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';
import { X } from 'lucide-react';

interface AddCostModalProps {
    productId: string;
    productUom: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddCostModal: React.FC<AddCostModalProps> = ({ productId, productUom, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        costType: 0,
        amount: 0,
        uom: productUom,
        effectiveFrom: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            uiAlert.warning("Amount must be greater than 0");
            return;
        }

        uiLoader.show();
        try {
            await productsApi.addProductCost(productId, {
                costType: formData.costType as CostType,
                amount: Number(formData.amount),
                uom: formData.uom,
                effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
                notes: formData.notes,
                isActive: true
            });
            uiAlert.success("Cost added successfully");
            onSuccess();
        } catch (error) {
            uiAlert.error("Failed to add cost");
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Add Product Cost</h3>
                        <p className="text-sm text-slate-400 font-medium">Record a new cost component.</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cost Type</label>
                        <select
                            value={formData.costType}
                            onChange={(e) => setFormData({ ...formData, costType: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                        >
                            {Object.entries(CostTypeLabel).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Per UOM</label>
                            <input
                                type="text"
                                value={formData.uom}
                                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Effective From</label>
                        <input
                            type="date"
                            value={formData.effectiveFrom}
                            onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm min-h-[80px]"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-sm shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            Add Cost
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
