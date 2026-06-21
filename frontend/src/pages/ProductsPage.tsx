import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, ProductTypeLabel } from '../api/productsApi';
import type { Product } from '../api/productsApi';

import { uiLoader } from '../store/loaderStore';
import { uiAlert } from '../store/alertStore';
import { Plus, Search, Filter, Edit2, Trash2, Box, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { CreateProductModal } from '../components/CreateProductModal';

export const ProductsPage: React.FC<{ tab: string }> = ({ tab }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [tab]);

    const loadProducts = async () => {
        uiLoader.show();
        try {
            const resp = await productsApi.getProducts(tab);
            setProducts(resp.data);
        } catch (e) {
            uiAlert.error("Failed to load products");
        } finally {
            uiLoader.hide();
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Inventory Catalog</h2>
                    <p className="text-slate-500 font-medium">Manage your raw materials and finished goods.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    Create Product
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-xs transition-all focus-within:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Cost</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Available Stock</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 mb-2">
                                                <Box size={32} />
                                            </div>
                                            <p className="text-slate-900 font-bold">No products found</p>
                                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Start building your catalog by adding your first raw material or finished good.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => {
                                    const totalCost = p.costs?.filter(c => c.isActive).reduce((sum, c) => sum + c.amount, 0) || 0;
                                    const activePrices = p.prices?.filter(pr => pr.isActive) || [];
                                    const minPrice = activePrices.length > 0 ? Math.min(...activePrices.map(pr => pr.amount)) : 0;
                                    const maxPrice = activePrices.length > 0 ? Math.max(...activePrices.map(pr => pr.amount)) : 0;
                                    const priceDisplay = activePrices.length === 0 ? '-' :
                                        minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => window.location.href = `/inventory/products/${p.id}`}
                                            className="group hover:bg-slate-50/80 transition-all"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                                                        <Box size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{p.name}</p>
                                                        <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.code}</p>
                                                         <Link to={`/inventory/products/${p.id}`} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 mt-0.5">
                                                            <ExternalLink size={10} /> View Details
                                                        </Link>
                                                    </div>  
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-black border tracking-wider",
                                                        p.productType === 0 ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                            p.productType === 1 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    )}>
                                                        {ProductTypeLabel[p.productType]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-sm font-bold text-slate-900">₹{totalCost.toFixed(2)}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-sm font-bold text-slate-900">{priceDisplay}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-sm font-black text-slate-900 leading-none mb-1">
                                                    {p.currentQuantity} <span className="text-[10px] text-slate-400 font-bold uppercase">{p.uom}</span>
                                                </p>
                                                {p.currentQuantity < 10 && (
                                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tight">Low Stock</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); window.location.href = `/inventory/products/${p.id}`; }}
                                                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreating && (
                <CreateProductModal
                    onCancel={() => setIsCreating(false)}
                    onSuccess={() => {
                        setIsCreating(false);
                        loadProducts();
                    }}
                />
            )}
        </div>
    );
};
