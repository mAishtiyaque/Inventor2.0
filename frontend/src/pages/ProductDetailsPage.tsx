import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, CostTypeLabel, PriceTypeLabel, ProductTypeLabel } from '../api/productsApi';
import type { Product } from '../api/productsApi';
import { uiLoader } from '../store/loaderStore';
import { uiAlert } from '../store/alertStore';
import { ArrowLeft, Plus, Calendar, History, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AddCostModal } from '../components/AddCostModal';
import { AddPriceModal } from '../components/AddPriceModal';
import { useConfirm } from '../hooks/useConfirm';

export const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const [product, setProduct] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<'costs' | 'prices'>('costs');
    const [showCostModal, setShowCostModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [costHistory, setCostHistory] = useState<any[]>([]);
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Load product details
    useEffect(() => {
        if (id) loadProduct();
    }, [id]);

    const loadProduct = async () => {
        if (!id) return;
        uiLoader.show();
        try {
            const resp = await productsApi.getProduct(id);
            setProduct(resp.data);
            if (showHistory) {
                loadHistory();
            }
        } catch (e) {
            uiAlert.error("Failed to load product details");
        } finally {
            uiLoader.hide();
        }
    };

    const loadHistory = async () => {
        if (!id) return;
        setIsHistoryLoading(true);
        try {
            const [costsResp, pricesResp] = await Promise.all([
                productsApi.getProductCostHistory(id),
                productsApi.getProductPriceHistory(id)
            ]);
            setCostHistory(costsResp.data);
            setPriceHistory(pricesResp.data);
        } catch (e) {
            uiAlert.error("Failed to load history");
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleRetireCost = async (costType: any) => {
        if (!id) return;
        const confirmed = await confirm({
            title: 'Retire Cost',
            message: `Are you sure you want to retire this ${CostTypeLabel[costType as keyof typeof CostTypeLabel] || costType} cost?`,
            confirmText: 'Retire',
            variant: 'danger'
        });

        if (!confirmed) return;

        uiLoader.show();
        try {
            await productsApi.removeProductCost(id, costType);
            uiAlert.success("Cost retired successfully");
            loadProduct();
        } catch (e) {
            uiAlert.error("Failed to retire cost");
        } finally {
            uiLoader.hide();
        }
    };

    const handleRetirePrice = async (priceType: any) => {
        if (!id) return;
        const confirmed = await confirm({
            title: 'Retire Price',
            message: `Are you sure you want to retire this ${PriceTypeLabel[priceType as keyof typeof PriceTypeLabel] || priceType} price?`,
            confirmText: 'Retire',
            variant: 'danger'
        });

        if (!confirmed) return;

        uiLoader.show();
        try {
            await productsApi.removeProductPrice(id, priceType);
            uiAlert.success("Price retired successfully");
            loadProduct();
        } catch (e) {
            uiAlert.error("Failed to retire price");
        } finally {
            uiLoader.hide();
        }
    };

    if (!product) return null;

    // Filter active items for display
    const activeCosts = product.costs?.filter((c) => c.isActive) || [];
    const activePrices = product.prices?.filter((p) => p.isActive) || [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/inventory/products')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    Back to Products
                </button>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-black border tracking-wider",
                                product.productType === 0 ? "bg-blue-50 text-blue-700 border-blue-100" :
                                    product.productType === 1 ? "bg-amber-50 text-amber-700 border-amber-100" :
                                        "bg-emerald-50 text-emerald-700 border-emerald-100"
                            )}>
                                {ProductTypeLabel[product.productType as keyof typeof ProductTypeLabel]}
                            </span>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h2>
                        </div>
                        <p className="text-slate-500 font-medium font-mono text-sm">{product.code} • {product.currentQuantity} {product.uom} in stock</p>
                    </div>
                    {/* Add Product Actions if needed */}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('costs')}
                        className={cn(
                            "pb-4 text-sm font-bold transition-all border-b-2",
                            activeTab === 'costs'
                                ? "text-slate-900 border-slate-900"
                                : "text-slate-400 border-transparent hover:text-slate-600"
                        )}
                    >
                        Cost Management
                    </button>
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={cn(
                            "pb-4 text-sm font-bold transition-all border-b-2",
                            activeTab === 'prices'
                                ? "text-slate-900 border-slate-900"
                                : "text-slate-400 border-transparent hover:text-slate-600"
                        )}
                    >
                        Pricing Strategy
                    </button>
                </div>
            </div>

            {/* Content Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'costs' ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Active Costs</h3>
                                <button
                                    onClick={() => setShowCostModal(true)}
                                    className="flex items-center gap-2 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add Cost
                                </button>
                            </div>

                            {activeCosts.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-medium">No active costs defined.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeCosts.map(cost => (
                                        <div key={cost.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm group hover:border-slate-300 transition-all">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{CostTypeLabel[cost.costType]}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-bold text-slate-900">₹{cost.amount}</p>
                                                    <span className="text-xs text-slate-400 font-medium">per {cost.uom || product.uom}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold mb-1 w-fit ml-auto">
                                                        <Calendar size={12} />
                                                        Effective from {formatDate(cost.effectiveFrom)}
                                                    </div>
                                                    {cost.notes && <p className="text-xs text-slate-400 italic max-w-[200px] truncate">{cost.notes}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleRetireCost(cost.costType)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Retire Cost"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Active Prices</h3>
                                <button
                                    onClick={() => setShowPriceModal(true)}
                                    className="flex items-center gap-2 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    <Plus size={14} />
                                    Add Price
                                </button>
                            </div>

                            {activePrices.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-medium">No active prices defined.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activePrices.map(price => (
                                        <div key={price.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm group hover:border-slate-300 transition-all">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{PriceTypeLabel[price.priceType]}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-bold text-slate-900">{price.currency || '₹'}{price.amount}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold mb-1 w-fit ml-auto">
                                                        <Calendar size={12} />
                                                        Effective from {formatDate(price.effectiveFrom)}
                                                    </div>
                                                    {price.notes && <p className="text-xs text-slate-400 italic max-w-[200px] truncate">{price.notes}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleRetirePrice(price.priceType)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove Strategy"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar / Stats / History access */}
                <div className="space-y-6">
                    <div className="p-6 bg-slate-900 text-white rounded-3xl">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <History size={18} />
                            History Tracking
                        </h4>
                        <p className="text-slate-400 text-sm mb-6">View full history of cost and price changes over time.</p>
                        <button
                            onClick={() => {
                                if (!showHistory) loadHistory();
                                setShowHistory(!showHistory);
                            }}
                            className={cn(
                                "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                showHistory ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20 text-white"
                            )}
                        >
                            {showHistory ? "Hide History" : "View Full History"}
                            {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>

                    {showHistory && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2 px-2">
                                <History size={16} />
                                Complete History
                                {isHistoryLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
                            </h4>

                            <div className="space-y-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                {/* Cost History Section */}
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Cost History</h5>
                                    <div className="space-y-3">
                                        {costHistory.filter(c => !c.isActive).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic px-2">No retired costs found.</p>
                                        ) : (
                                            costHistory.filter(c => !c.isActive).map(cost => (
                                                <div key={cost.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm opacity-60">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {CostTypeLabel[cost.costType as keyof typeof CostTypeLabel]}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {formatDate(cost.effectiveFrom)} - {cost.effectiveTo ? formatDate(cost.effectiveTo) : 'Retired'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">₹{cost.amount}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Price History Section */}
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Price History</h5>
                                    <div className="space-y-3">
                                        {priceHistory.filter(p => !p.isActive).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic px-2">No retired prices found.</p>
                                        ) : (
                                            priceHistory.filter(p => !p.isActive).map(price => (
                                                <div key={price.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm opacity-60">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {PriceTypeLabel[price.priceType as keyof typeof PriceTypeLabel]}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {formatDate(price.effectiveFrom)} - {price.effectiveTo ? formatDate(price.effectiveTo) : 'Retired'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">{price.currency || '₹'}{price.amount}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCostModal && (
                <AddCostModal
                    productId={product.id}
                    productUom={product.uom}
                    onSuccess={() => {
                        setShowCostModal(false);
                        loadProduct();
                    }}
                    onCancel={() => setShowCostModal(false)}
                />
            )}

            {showPriceModal && (
                <AddPriceModal
                    productId={product.id}
                    onSuccess={() => {
                        setShowPriceModal(false);
                        loadProduct();
                    }}
                    onCancel={() => setShowPriceModal(false)}
                />
            )}
        </div>
    );
};
