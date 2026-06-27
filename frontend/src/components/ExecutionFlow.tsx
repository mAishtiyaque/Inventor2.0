import React, { useState, useEffect } from 'react';
import { manufacturingApi, ExecutionStatusEnum } from '../api/manufacturingApi';
import type { OutIOsDeclaration, ProcessDefinition } from '../api/manufacturingApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';
import { Timer, CheckCircle2, ArrowRight, Trash2, Package, UserCheck } from 'lucide-react';
import { productsApi, type Product, CostTypeLabel } from '../api/productsApi';
import { vendorApi } from '../api/vendorApi';
import type { Vendor } from '../api/vendorApi';
interface ExecutionFlowProps {
    definition: ProcessDefinition;
    initialExecutionId?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ExecutionFlow: React.FC<ExecutionFlowProps> = ({
    definition,
    initialExecutionId,
    onSuccess,
    onCancel
}) => {
    const activeVersions = definition.versions?.filter(v => v.status === 0) || [];

    const [step, setStep] = useState<'PLAN' | 'EXECUTE'>(
        initialExecutionId ? 'EXECUTE' : 'PLAN'
    );

    const [selectedVersionId, setSelectedVersionId] = useState<string>(
        activeVersions.length > 0 ? activeVersions[0].id : ''
    );

    const [plannedQty, setPlannedQty] = useState<number>(0);
    const [vendorId, setVendorId] = useState<string>('');
    const [brokers, setBrokers] = useState<Vendor[]>([]);
    const [outIOs, setOutIOs] = useState<OutIOsDeclaration[]>([]);
    const [scrapProducts, setScrapProducts] = useState<Product[]>([]);
    const [executionId, setExecutionId] = useState<string | null>(initialExecutionId || null);
    const [tweakedIOs, setTweakedIOs] = useState<any[]>([]);
    const [tweakedCosts, setTweakedCosts] = useState<any[]>([]);

    useEffect(() => {
        if (initialExecutionId) {
            loadExecution(initialExecutionId);
        }
        loadBrokers();
    }, [initialExecutionId]);

    const currentVersion = definition.versions?.find(v => v.id === selectedVersionId);

    useEffect(() => {
        if (currentVersion) {
            const iosList = (currentVersion.iOs || []).map(io => ({
                productId: io.productId,
                product: io.product,
                direction: io.direction,
                plannedQty: (io.standardQty || 0) * plannedQty,
                uom: io.uom,
                unitCost: io.product?.costs?.filter((c: any) => c.isActive).reduce((sum: number, c: any) => sum + c.amount, 0) || 0
            }));
            setTweakedIOs(iosList);

            const costsList = (currentVersion.costs || []).map(c => ({
                costType: c.costType,
                rate: c.rate,
                quantity: plannedQty,
                uom: c.uom
            }));
            setTweakedCosts(costsList);
        } else {
            setTweakedIOs([]);
            setTweakedCosts([]);
        }
    }, [selectedVersionId, plannedQty]);
  

    const loadBrokers = async () => {
        try {
            const res = await vendorApi.getBrokers();
            setBrokers(res.data.filter(b => b.isActive));
        } catch {
            // ignore
        }
    };

    const loadExecution = async (id: string) => {
        uiLoader.show();
        try {
            const response = await manufacturingApi.getExecution(id);
            const exec = response.data;
            setPlannedQty(exec.plannedQty);
            setSelectedVersionId(exec.processDefinitionVersionId);
            // initialize outIOs
            //const initialOutIOs = (definition.versions?.find(v => v.id === exec.processDefinitionVersionId)?.iOs || [])
            const initialOutIOs = exec.iOs
              ?.filter(io => io.direction === 1)
              .map(io => ({
                productId: io.productId,
                actualQty: io.plannedQty,
                scrapQty: 0,
                scrapDestinationProductId: ''
              }));
            setOutIOs(initialOutIOs ?? []);

            const ps = await productsApi.getProducts('scrap');
            setScrapProducts(ps.data ?? []);

        } catch (error) {
            uiAlert.error("Failed to load execution details");
        } finally {
            uiLoader.hide();
        }
    };

    const handleStart = async () => {
        if (plannedQty <= 0) {
            uiAlert.warning("Please enter a valid quantity");
            return;
        }

        uiLoader.show();
        try {
            const response = await manufacturingApi.createExecution({
                processDefinitionVersionId: selectedVersionId,
                plannedQty,
                vendorId: vendorId || null,
                iOs: tweakedIOs.map(io => ({
                    productId: io.productId,
                    direction: io.direction,
                    plannedQty: io.plannedQty,
                    unitCost: io.unitCost
                })),
                costs: tweakedCosts.map(c => ({
                    costType: c.costType,
                    rate: c.rate,
                    quantity: c.quantity
                }))
            });
            setExecutionId(response.data.id);
            setStep('EXECUTE');
            uiAlert.success("Production started!");
        } catch (error: any) {
            uiAlert.error(error.response?.data?.message || "Failed to start production");
        } finally {
            uiLoader.hide();
        }
    };

    const handleComplete = async () => {
        if (!executionId) return;

        uiLoader.show();
        try {
            // Convert empty string string to null for API
            const formattedOutIOs = outIOs.map(o => ({
                ...o,
                scrapDestinationProductId: o.scrapDestinationProductId === '' ? null : o.scrapDestinationProductId
            }));
            await manufacturingApi.transitionExecution(executionId, {
                nextStatus: ExecutionStatusEnum.COMPLETED,
                outIOs: formattedOutIOs
            });
            uiAlert.success("Production completed! Inventory updated.");
            onSuccess();
        } catch (error) {
            uiAlert.error("Failed to complete production");
        } finally {
            uiLoader.hide();
        }
    };


    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white w-full ${step === 'PLAN' ? 'max-w-3xl' : 'max-w-lg'} rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{definition.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Process Execution • {step === 'PLAN' ? 'Configure Details' : 'Active Execution'}
                        </p>
                        {step === 'PLAN' && currentVersion?.notes && (
                            <p className="text-[10px] text-slate-500 font-medium mt-1">
                                Recipe Notes: {currentVersion.notes}
                            </p>
                        )}
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    {step === 'PLAN' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Config Column */}
                            <div className="space-y-6">
                                {activeVersions.length > 1 && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                            Recipe Version
                                        </label>
                                        <select
                                            value={selectedVersionId}
                                            onChange={(e) => setSelectedVersionId(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700"
                                        >
                                            {activeVersions.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    Version #{v.versionNumber} {v.notes ? `(${v.notes})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                        Planned Target Quantity
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={plannedQty || ''}
                                            onChange={(e) => setPlannedQty(Number(e.target.value))}
                                            className="w-full pl-5 pr-16 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all text-xl font-bold text-slate-900"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-widest">Units</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                                        <UserCheck size={12} /> Assign Broker (Optional)
                                    </label>
                                    <select
                                        value={vendorId}
                                        onChange={(e) => setVendorId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-700"
                                    >
                                        <option value="">— Internal Production (No Broker) —</option>
                                        {brokers.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleStart}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 mt-8"
                                >
                                    Begin Production <ArrowRight size={18} />
                                </button>
                            </div>

                            {/* Right Preview Column */}
                            <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                {currentVersion ? (
                                    <>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Materials</h4>
                                            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                                                {tweakedIOs.filter(io => io.direction === 0).map((io) => {
                                                    const actualIdx = tweakedIOs.findIndex(x => x.productId === io.productId && x.direction === 0);
                                                    return (
                                                        <div key={io.productId} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-100">
                                                            <span className="text-slate-600 font-semibold">{io.product?.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    value={io.plannedQty}
                                                                    onChange={(e) => {
                                                                        const arr = [...tweakedIOs];
                                                                        arr[actualIdx].plannedQty = Number(e.target.value);
                                                                        setTweakedIOs(arr);
                                                                    }}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-right font-bold focus:border-slate-900 outline-none text-xs"
                                                                />
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{io.uom}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {tweakedIOs.filter(io => io.direction === 0).length === 0 && (
                                                    <p className="text-xs text-slate-400 italic">No input materials required.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expected Outputs</h4>
                                            <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1">
                                                {tweakedIOs.filter(io => io.direction === 1).map((io) => {
                                                    const actualIdx = tweakedIOs.findIndex(x => x.productId === io.productId && x.direction === 1);
                                                    return (
                                                        <div key={io.productId} className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-100">
                                                            <span className="text-slate-600 font-semibold">{io.product?.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    value={io.plannedQty}
                                                                    onChange={(e) => {
                                                                        const arr = [...tweakedIOs];
                                                                        arr[actualIdx].plannedQty = Number(e.target.value);
                                                                        setTweakedIOs(arr);
                                                                    }}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-right font-bold focus:border-slate-900 outline-none text-xs"
                                                                />
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{io.uom}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overheads & Cost Factors</h4>
                                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                                {tweakedCosts.map((cost, idx) => (
                                                    <div key={cost.costType} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-100">
                                                        <span className="text-slate-600 font-semibold">{CostTypeLabel[cost.costType as keyof typeof CostTypeLabel]}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-slate-400">₹</span>
                                                            <input
                                                                type="number"
                                                                value={cost.rate}
                                                                onChange={(e) => {
                                                                    const arr = [...tweakedCosts];
                                                                    arr[idx].rate = Number(e.target.value);
                                                                    setTweakedCosts(arr);
                                                                }}
                                                                className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-right font-bold focus:border-slate-900 outline-none text-xs"
                                                            />
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase">/ {cost.uom}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {tweakedCosts.length === 0 && (
                                                    <p className="text-xs text-slate-400 italic">No overhead costs defined.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                                        Select a recipe version to preview details.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                                    <Timer size={32} className="animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-900">Production In Progress</h4>
                                    <p className="text-sm text-blue-600 font-medium mt-0.5">Job #{executionId?.split('-')[0].toUpperCase()}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 h-[calc(60vh-200px)] overflow-y-auto">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output Reporting</h4>
                                
                                {currentVersion?.iOs?.filter(io => io.direction === 1).map(io => {
                                    
                                    const outState = outIOs.find(o => o.productId === io.productId);
                                    if (!outState) return <div className="w-full bg-red-50 rounded-xl p-3 border border-slate-200 text-center text-red-800 text-sm font-bold">No Output Found for the Job Order!</div>;
                                    
                                    const expectedOutput = (io.standardQty || 0) * plannedQty;

                                    return (
                                        <div key={io.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Package size={16} className="text-indigo-500" />
                                                    <span className="font-bold text-slate-900">{io.product?.name}</span>
                                                </div>
                                                <span className="text-xs font-medium text-slate-500">
                                                    Expected: {expectedOutput} {io.uom}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                        Good Yield
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={outState.actualQty}
                                                        onChange={(e) => {
                                                            const arr = [...outIOs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].actualQty = Number(e.target.value);
                                                            setOutIOs(arr);
                                                        }}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                        Scrap Yield
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={outState.scrapQty}
                                                        onChange={(e) => {
                                                            const arr = [...outIOs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].scrapQty = Number(e.target.value);
                                                            setOutIOs(arr);
                                                        }}
                                                        className="w-full px-4 py-3 bg-red-50/50 border border-red-100 rounded-xl focus:border-red-500 outline-none font-bold text-red-600"
                                                    />
                                                </div>
                                            </div>

                                            {outState.scrapQty > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-200">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Trash2 size={12}/> Scrap Destination Bin (Optional)
                                                    </label>
                                                    <select
                                                        value={outState.scrapDestinationProductId || ''}
                                                        onChange={(e) => {
                                                            const arr = [...outIOs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].scrapDestinationProductId = e.target.value;
                                                            setOutIOs(arr);
                                                        }}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium"
                                                    >
                                                        <option value="">-- Do Not Track Physical Scrap --</option>
                                                        {scrapProducts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleComplete}
                                className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10"
                            >
                                <CheckCircle2 size={24} /> Confirm & Mark Completed
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
