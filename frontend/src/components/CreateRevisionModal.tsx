import React, { useState, useEffect } from 'react';
import { manufacturingApi, type ProcessDefinition } from '../api/manufacturingApi';
import { CostTypeLabel, CostTypeValues, productsApi, type Product } from '../api/productsApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';
import { X, Plus, Trash2, Layers2, DollarSign } from 'lucide-react';

interface CreateRevisionModalProps {
    definitionId: string;
    versionId?: string; // If provided, we are editing
    isEditMode?: boolean;
    initialIos?: any[];
    initialCosts?: any[];
    initialNotes?: string;
    setDefinition: (processDefinition: ProcessDefinition | null) => void;
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateRevisionModal: React.FC<CreateRevisionModalProps> = ({
    definitionId,
    versionId,
    isEditMode = false,
    initialIos,
    initialCosts,
    initialNotes,
    setDefinition,
    onSuccess,
    onCancel
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [ios, setIos] = useState<any[]>(initialIos ? initialIos.map(io => ({
        productId: io.productId || io.product?.id,
        direction: io.direction,
        standardQty: io.standardQty,
        uom: io.uom
    })) : []);
    const [costs, setCosts] = useState<any[]>(initialCosts ? initialCosts.map(c => ({
        costType: c.costType,
        rate: c.rate,
        uom: c.uom
    })) : []);
    const [notes, setNotes] = useState<string>(initialNotes || '');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const resp = await productsApi.getProducts('all');
            setProducts(resp.data);
        } catch (e) {
            uiAlert.error("Failed to load products for BOM selection");
        }
    };

    const addIO = () => {
        setIos([...ios, { productId: '', direction: 1, standardQty: 1, uom: 'Units' }]);
    };

    const removeIO = (index: number) => {
        setIos(ios.filter((_, i) => i !== index));
    };

    const updateIO = (index: number, field: string, value: any) => {
        const newIos = [...ios];
        newIos[index] = { ...newIos[index], [field]: value };

        // Auto-set UOM if product is selected
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) newIos[index].uom = product.uom;
        }

        setIos(newIos);
    };

    const addCost = () => {
        setCosts([...costs, { costType: 0, rate: 0, uom: 'Unit' }]);
    };

    const removeCost = (index: number) => {
        setCosts(costs.filter((_, i) => i !== index));
    };

    const updateCost = (index: number, field: string, value: any) => {
        const newCosts = [...costs];
        newCosts[index] = { ...newCosts[index], [field]: value };
        setCosts(newCosts);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (ios.length === 0) {
            uiAlert.warning("Please add at least one input/output to the BOM");
            return;
        }

        uiLoader.show();
        try {
            if (isEditMode && versionId) {
                await manufacturingApi.updateVersion(definitionId, versionId, { ios, costs, notes });
                uiAlert.success("Revision updated successfully");
            } else {
                await manufacturingApi.createVersion(definitionId, { ios, costs, notes });
                uiAlert.success("New revision created successfully");
            }
            loadDefinition();
            onSuccess();
        } catch (error) {
            uiAlert.error(isEditMode ? "Failed to update revision" : "Failed to create revision");
        } finally {
            uiLoader.hide();
        }
    };

    const loadDefinition = async () => {
            if (!definitionId) return;
            uiLoader.show();
            try {
                const resp = await manufacturingApi.getDefinition(definitionId);
                setDefinition(resp.data);
            } catch (e) {
                uiAlert.error("Failed to load definition");
            } finally {
                uiLoader.hide();
            }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {isEditMode ? "Edit Revision" : "Create New Revision (BOM)"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Define materials, outputs, and overhead costs.</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* IO Section */}
                    <input type="text" placeholder='Insert Version Notes...' className='w-full mb-5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm' 
                    value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Layers2 size={14} className="text-indigo-500" />
                                Material Specifications (BOM)
                            </h4>
                            <button
                                type="button"
                                onClick={addIO}
                                className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors"
                            >
                                <Plus size={14} /> Add Line Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {ios.map((io, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 group animate-in fade-in slide-in-from-top-1">
                                    <div className="col-span-4">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Product</label>
                                        <select
                                            value={io.productId}
                                            onChange={(e) => updateIO(idx, 'productId', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Direction</label>
                                        <select
                                            value={io.direction}
                                            onChange={(e) => updateIO(idx, 'direction', parseInt(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        >
                                            <option value={0}>Input</option>
                                            <option value={1}>Output</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={io.standardQty}
                                            onChange={(e) => updateIO(idx, 'standardQty', parseFloat(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">UOM</label>
                                        <input
                                            type="text"
                                            value={io.uom}
                                            readOnly
                                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeIO(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {ios.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <p className="text-sm text-slate-400 font-medium">No materials defined in this BOM.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Cost Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <DollarSign size={14} className="text-emerald-500" />
                                Applied Overheads & Labor
                            </h4>
                            <button
                                type="button"
                                onClick={addCost}
                                className="flex items-center gap-2 text-emerald-600 font-bold text-xs hover:text-emerald-700 transition-colors"
                            >
                                <Plus size={14} /> Add Cost Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {costs.map((cost, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-1">
                                    <div className="col-span-5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Cost Type</label>
                                        <select
                                            value={cost.costType}
                                            onChange={(e) => updateCost(idx, 'costType', Number(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            {CostTypeValues.map((type) => (
                                                <option key={type} value={type}>
                                                    {CostTypeLabel[type]}
                                                </option>   
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Rate (₹)</label>
                                        <input
                                            type="number"
                                            value={cost.rate}
                                            onChange={(e) => updateCost(idx, 'rate', parseFloat(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">UOM</label>
                                        <input
                                            type="text"
                                            value={cost.uom}
                                            onChange={(e) => updateCost(idx, 'uom', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="per Unit/Hr"
                                        />
                                    </div>
                                    <div className="col-span-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeCost(idx)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {costs.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <p className="text-sm text-slate-400 font-medium">No overhead costs defined for this revision.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </form>

                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                    >
                        {isEditMode ? "Save Update" : "Save Revision"}
                    </button>
                </div>
            </div>
        </div>
    );
};
