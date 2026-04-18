import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { manufacturingApi } from '../../api/manufacturingApi';
import { useModal } from '../../store/modalStore';
import type { ProcessDefinition, ProcessDefinitionVersion, ProcessIODefinition, ProcessCostDefinition } from '../../api/manufacturingApi';

import { uiLoader } from '../../store/loaderStore';
import { uiAlert } from '../../store/alertStore';
import { useConfirm } from '../../hooks/useConfirm';
import { ArrowLeft, Plus, Edit2, Layers2, DollarSign, PackagePlus, Copy, Trash2, Ban } from 'lucide-react';

import { cn } from '../../lib/utils';
import { CostTypeLabel } from '../../api/productsApi';

export const ProcessDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const modal = useModal();
    const { confirm } = useConfirm();
    const [definition, setDefinition] = useState<ProcessDefinition | null>(null);

    useEffect(() => {
        if (id) loadDefinition();
    }, [id]);

    const loadDefinition = async () => {
        if (!id) return;
        uiLoader.show();
        try {
            const resp = await manufacturingApi.getDefinition(id);
            setDefinition(resp.data);
        } catch (e) {
            uiAlert.error("Failed to load process details");
        } finally {
            uiLoader.hide();
        }
    };

    const handleDeleteVersion = async (versionId: string) => {
        const confirmed = await confirm({
            title: 'Delete Revision',
            message: 'Are you sure you want to delete this revision? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'danger'
        });

        if (!confirmed) return;

        uiLoader.show();
        try {
            await manufacturingApi.deleteVersion(id!, versionId);
            uiAlert.success("Revision deleted successfully");
            loadDefinition();
        } catch (e) {
            uiAlert.error("Failed to delete revision");
        } finally {
            uiLoader.hide();
        }
    };

    const handleRetireVersion = async (versionId: string) => {
        const confirmed = await confirm({
            title: 'Retire Revision',
            message: 'Are you sure you want to retire this revision? This action cannot be undone.',
            confirmText: 'Retire',
            variant: 'danger'
        });

        if (!confirmed) return;

        uiLoader.show();
        try {
            await manufacturingApi.retireVersion(id!, versionId);
            uiAlert.success("Revision retired successfully");
            loadDefinition();
        } catch (e) {
            uiAlert.error("Failed to retire revision");
        } finally {
            uiLoader.hide();
        }
    };

    if (!definition) return null;

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <button
                onClick={() => navigate('/manufacturing/definitions')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
            >
                <ArrowLeft size={16} />
                Back to Definitions
            </button>

            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md border border-indigo-100 uppercase tracking-widest">Recipe</span>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{definition.name}</h2>
                    </div>
                    <p className="text-slate-500 font-medium">{definition.description || "Comprehensive workflow for item production."}</p>
                </div>
                <button
                    onClick={() => modal.open('CREATE_REVISION', { definitionId: definition.id, setDefinition })}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    Create New Revision (BOM)
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {definition.versions?.sort((a, b) => b.versionNumber - a.versionNumber).map((version: ProcessDefinitionVersion) => {
                    const isRetired = version.status === 1;
                    const totalBOMCost: number = version.iOs.filter(io => io.direction === 0).reduce((acc, io) => {
                        const cost: number = io.product.costs?.filter(c => c.isActive).reduce((sum, c) => sum + c.amount, 0) || 0;
                        return acc + (cost * io.standardQty);
                    }, 0) || 0;
                    const totalCostingAndOverheads: number = version.costs?.reduce((acc: number, curr: ProcessCostDefinition) => acc + curr.rate, 0) || 0;
                    return <div key={version.id} className={cn(
                        "bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all relative",
                        isRetired && "opacity-50 grayscale-[0.5]"
                    )}>
                        <div className='bg-slate-50/50 border-b border-slate-100'>
                            <div className="px-8 pt-6 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 font-black text-xs shadow-sm">
                                        V{version.versionNumber}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Revision {version.id.split('-')[0].toUpperCase()}</h4>
                                        {version.status === 0 ? <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Standard</p>
                                        </div> : <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Inactive Standard</p>
                                        </div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {/* BOM Summary Footer */}
                                    {version.iOs && version.iOs.length > 0 && (
                                        <div className="grid grid-cols-3 grid-rows-2 items-center font-black text-[10px] text-slate-400 uppercase tracking-widest">

                                            <p>
                                                Total Roll-up Cost
                                                <span
                                                    className="cursor-help text-slate-300 ml-1"
                                                    title="Sum of BOM Cost & Costing & Overheads"
                                                >
                                                    ⓘ
                                                </span>
                                            </p>

                                            <p>
                                                Total BOM Cost
                                                <span
                                                    className="cursor-help text-slate-300 ml-1"
                                                    title="Sum of all input material contributions"
                                                >
                                                    ⓘ
                                                </span>
                                            </p>

                                            <p>
                                                Costing & Overheads
                                                <span
                                                    className="cursor-help text-slate-300 ml-1"
                                                    title="Sum of all Process Costs & Overheads"
                                                >
                                                    ⓘ
                                                </span>
                                            </p>

                                            <p className="text-xl font-black text-indigo-900 leading-none">
                                                ₹{(totalBOMCost + totalCostingAndOverheads).toFixed(2)}
                                            </p>

                                            <p className="text-sm font-black text-indigo-900 leading-none">
                                                ₹{totalBOMCost.toFixed(2)}
                                            </p>

                                            <p className="text-sm font-black text-indigo-900 leading-none">
                                                ₹{totalCostingAndOverheads.toFixed(2)}
                                            </p>

                                        </div>

                                    )}
                                    {!version.isUsed &&
                                        <button
                                            onClick={() => modal.open('CREATE_REVISION', {
                                                definitionId: definition.id,
                                                versionId: version.id,
                                                isEditMode: !version.isUsed,
                                                initialIos: version.iOs,
                                                initialCosts: version.costs,
                                                initialNotes: version.notes,
                                                setDefinition
                                            })}
                                            className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all shadow-xs hover:border-slate-300"
                                            title={version.isUsed ? "Create new revision from this" : "Edit this revision"}
                                        >
                                            <Edit2 size={16} />
                                        </button>}
                                    {!isRetired && (
                                        <button
                                            onClick={() => handleRetireVersion(version.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-xl transition-all shadow-xs hover:border-red-100"
                                            title="Disable Version"
                                        >
                                            <Ban size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => modal.open('CREATE_REVISION', {
                                            definitionId: definition.id,
                                            initialIos: version.iOs,
                                            initialCosts: version.costs,
                                            initialNotes: version.notes,
                                            setDefinition
                                        })}
                                        className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all shadow-xs hover:border-slate-300"
                                        title="Duplicate Revision"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    {!version.isUsed && (
                                        <button
                                            onClick={() => handleDeleteVersion(version.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-xl transition-all shadow-xs hover:border-red-100"
                                            title="Delete Revision"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className='px-8 pt-2 pb-2 text-[10px] text-slate-900'>{version.notes || 'No Notes Available'}</div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Layers2 size={14} className="text-indigo-500" />
                                    Bill of Materials (BOM)
                                </h5>
                                <div className="space-y-4">
                                    {version.iOs?.sort((a, b) => a.direction - b.direction).map((io: ProcessIODefinition, index: number, array: ProcessIODefinition[]) => {
                                        const prevIo = index > 0 ? array[index - 1] : null;
                                        const showSectionHeader = !prevIo || prevIo.direction !== io.direction;

                                        const totalProductCost = io.product.costs?.filter(c => c.isActive).reduce((sum, c) => sum + c.amount, 0) || 0;
                                        const activePrices = io.product.prices?.filter(pr => pr.isActive) || [];
                                        const minPrice = activePrices.length > 0 ? Math.min(...activePrices.map(pr => pr.amount)) : 0;
                                        const maxPrice = activePrices.length > 0 ? Math.max(...activePrices.map(pr => pr.amount)) : 0;
                                        const priceRange = activePrices.length === 0 ? '-' :
                                            minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

                                        const currentStock = io.product.currentQuantity || 0;
                                        const isFinishedProduct = io.direction === 1;
                                        const totalContribution = totalProductCost * io.standardQty;

                                        // Stock messaging logic
                                        const stockMessage = currentStock < 0
                                            ? `Short by`
                                            : currentStock < 10 && currentStock > 0
                                                ? 'Low Stock'
                                                : currentStock > 0
                                                    ? 'In Stock'
                                                    : 'Out of Stock';

                                        const stockColorClass = currentStock < 0
                                            ? "bg-red-50 text-red-600 border-red-100"
                                            : currentStock < 10 && currentStock > 0
                                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                                : currentStock > 0
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-slate-50 text-slate-400 border-slate-100";

                                        const stockDotClass = currentStock < 0
                                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                            : currentStock < 10 && currentStock > 0
                                                ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                                : currentStock > 0
                                                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                    : "bg-slate-400";

                                        return <React.Fragment key={io.id}>
                                            {showSectionHeader && (
                                                <div className={cn(
                                                    "pt-4 pb-2 mb-2 flex items-center gap-2 border-b border-slate-100"
                                                )}>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                                        isFinishedProduct ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {isFinishedProduct ? 'Outputs' : 'Inputs'}
                                                    </span>
                                                    <div className="flex-1 h-px bg-slate-100"></div>
                                                </div>
                                            )}
                                            <div className="p-5 bg-white border border-slate-200 rounded-3xl group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-default shadow-sm relative overflow-hidden">
                                                {/* Header Section: Direction Badge and Stock Status */}
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            isFinishedProduct ? "bg-green-500" : "bg-blue-500"
                                                        )}></div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {isFinishedProduct ? 'Output Product' : 'Input Material'}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight",
                                                        stockColorClass
                                                    )} title="Check inventory level">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", stockDotClass)}></div>
                                                        {stockMessage}: {Math.abs(currentStock)} {io.product.uom}
                                                    </div>
                                                </div>

                                                {/* Product Info Section */}
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110",
                                                        isFinishedProduct ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        <Layers2 size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h6 className="font-bold text-slate-900 text-lg leading-tight truncate mb-1" onClick={() => navigate(`/inventory/products/${io.productId}`)} style={{ cursor: 'pointer' }}>
                                                            {io.product.name}
                                                        </h6>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-slate-100 bg-slate-900 px-2 py-0.5 rounded uppercase tracking-widest">{io.product.code}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">ID: {io.product.id.split('-')[0].toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pricing Logic Section */}
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                                    {isFinishedProduct ? (
                                                        /* Finished Product Layout */
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                                    Selling Price <span className="cursor-help text-slate-300" title="Active selling price range for this product.">ⓘ</span>
                                                                </p>
                                                                <p className="text-lg font-black text-indigo-600 leading-none">{priceRange}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                                                    Production Cost <span className="cursor-help text-slate-300" title="Calculated based on current material costs.">ⓘ</span>
                                                                </p>
                                                                <p className="text-lg font-black text-slate-900 leading-none">₹{totalProductCost}
                                                                    <span className="text-[10px] text-slate-400 font-bold tracking-widest mb-1 flex items-center justify-end gap-1">{io.standardQty}x{io.product.uom}</span>
                                                                </p>
                                                            </div>
                                                            <div className="col-span-2 pt-2 border-t border-slate-200/50">
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                                        Est. Margin <span className="cursor-help text-slate-300" title="Estimated profit margin based on min selling price.">ⓘ</span>
                                                                    </p>
                                                                    <p className={cn(
                                                                        "text-sm font-black",
                                                                        minPrice - totalProductCost > 0 ? "text-emerald-600" : "text-red-600"
                                                                    )}>
                                                                        {minPrice > 0 ? `+₹${(minPrice - totalProductCost).toFixed(2)} (${(((minPrice - totalProductCost) / minPrice) * 100).toFixed(1)}%)` : 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Input Material Layout */
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Cost/Unit</p>
                                                                <p className="text-sm font-black text-slate-900 leading-tight">₹{totalProductCost}</p>
                                                            </div>
                                                            <div className="text-center border-x border-slate-200/50">
                                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Qty Used</p>
                                                                <p className="text-sm font-black text-slate-900 leading-tight">x {io.standardQty}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Cost</p>
                                                                <p className="text-base font-black text-blue-600 leading-tight">₹{totalContribution}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div></React.Fragment>
                                    })}
                                    {version.iOs?.length === 0 && (
                                        <p className="text-center text-slate-400 text-sm">No components added yet</p>
                                    )}

                                    {!version.isUsed &&
                                        <button
                                            onClick={() => modal.open('CREATE_REVISION', {
                                                definitionId: definition.id,
                                                versionId: version.id,
                                                isEditMode: !version.isUsed,
                                                initialIos: version.isUsed ? version.iOs : [...(version.iOs || []), { productId: '', direction: 0, standardQty: 1, uom: 'Units' }],
                                                initialCosts: version.costs,
                                                initialNotes: version.notes,
                                                setDefinition
                                            })}
                                            className="w-full border-2 border-dashed border-slate-100 py-4 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 mt-4"
                                        >
                                            <PackagePlus size={16} />
                                            Add Component
                                        </button>}
                                </div>
                            </div>

                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <DollarSign size={14} className="text-emerald-500" />
                                    Costing & Overheads
                                </h5>
                                <div className="space-y-4">
                                    {version.costs?.map((cost: ProcessCostDefinition) => (
                                        <div key={cost.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-slate-200 transition-all cursor-default">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{CostTypeLabel[cost.costType as keyof typeof CostTypeLabel]}</p>
                                            </div>
                                            <p className="text-sm font-black text-slate-700 italic">₹{cost.rate}
                                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest"> / {cost.uom}</span>
                                            </p>
                                        </div>
                                    ))}
                                    {!version.isUsed &&
                                        <button
                                            onClick={() => modal.open('CREATE_REVISION', {
                                                definitionId: definition.id,
                                                versionId: version.id,
                                                isEditMode: !version.isUsed,
                                                initialIos: version.iOs,
                                                initialCosts: version.isUsed ? version.costs : [...(version.costs || []), { costType: 0, rate: 0, uom: 'Unit' }],
                                                initialNotes: version.notes,
                                                setDefinition
                                            })}
                                            className="w-full border-2 border-dashed border-slate-100 py-4 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-emerald-100 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Add Overhead
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                })}

                {(!definition.versions || definition.versions.length === 0) && (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-2xl text-slate-300 mb-6">
                            <Layers2 size={40} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">No Versions Defined</h4>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">This process template doesn't have any Bill of Materials yet. Create the first revision to start manufacturing.</p>
                        <button
                            onClick={() => modal.open('CREATE_REVISION', { definitionId: definition.id, setDefinition })}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            Create First Revision
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
