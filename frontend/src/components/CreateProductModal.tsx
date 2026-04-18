import React, { useState } from 'react';
import { productsApi, ProductTypeLabel, type ProductType } from '../api/productsApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface CreateProductModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<{
        code: string;
        name: string;
        productType: ProductType;
        uom: string;
    }>({
        code: '',
        name: '',
        productType: 0 as ProductType,
        uom: 'Units'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.code) {
            uiAlert.warning("Name and Code are required");
            return;
        }

        uiLoader.show();
        try {
            await productsApi.createProduct(formData as any);
            uiAlert.success("Product created successfully");
            onSuccess();
        } catch (error) {
            uiAlert.error("Failed to create product");
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create New Product</h3>
                        <p className="text-sm text-slate-400 font-medium">Add a new item to your inventory catalog.</p>
                    </div>
                    <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Internal Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-mono text-sm"
                                placeholder="E.G. RM-FABRIC-001"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Base UOM</label>
                            <input
                                type="text"
                                value={formData.uom}
                                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm"
                                placeholder="Units, Meters, Kg..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm"
                            placeholder="E.G. Premium Cotton Fabric"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category / Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(ProductTypeLabel).map(([key, value]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, productType: Number(key) as ProductType })}
                                    className={cn(
                                        "py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                        formData.productType === Number(key)
                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-sm shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            Create Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
