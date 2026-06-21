import React, { useState, useEffect } from 'react';
import { manufacturingApi, ExecutionStatusEnum } from '../api/manufacturingApi';
import type { ProcessDefinition } from '../api/manufacturingApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';
import { Timer, CheckCircle2, AlertTriangle, ArrowRight, ChevronRight, Trash2, Package } from 'lucide-react';
import { productsApi, type Product } from '../api/productsApi';
import type { OutputDeclaration } from '../api/manufacturingApi';
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

    const [step, setStep] = useState<'VERSION' | 'PLAN' | 'EXECUTE' | 'COMPLETE'>(
        initialExecutionId ? 'EXECUTE' : (activeVersions.length > 1 ? 'VERSION' : 'PLAN')
    );

    const [selectedVersionId, setSelectedVersionId] = useState<string>(
        activeVersions.length === 1 ? activeVersions[0].id : ''
    );

    const [plannedQty, setPlannedQty] = useState<number>(0);
    const [outputs, setOutputs] = useState<OutputDeclaration[]>([]);
    const [scrapProducts, setScrapProducts] = useState<Product[]>([]);
    const [executionId, setExecutionId] = useState<string | null>(initialExecutionId || null);

    useEffect(() => {
        if (initialExecutionId) {
            loadExecution(initialExecutionId);
        }
    }, [initialExecutionId]);

    const loadExecution = async (id: string) => {
        uiLoader.show();
        try {
            const response = await manufacturingApi.getExecution(id);
            const exec = response.data;
            setPlannedQty(exec.plannedQty);
            setSelectedVersionId(exec.processDefinitionVersionId);
            // initialize outputs
            const initialOutputs = (definition.versions?.find(v => v.id === exec.processDefinitionVersionId)?.iOs || [])
              .filter(io => io.direction === 1)
              .map(io => ({
                productId: io.productId,
                actualQty: io.standardQty * exec.plannedQty,
                scrapQty: 0,
                scrapDestinationProductId: ''
              }));
            setOutputs(initialOutputs);

            const ps = await productsApi.getProducts('scrap');
            setScrapProducts(ps.data);

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
                plannedQty
            });
            setExecutionId(response.data.id);
            setStep('EXECUTE');
            uiAlert.success("Production started!");
        } catch (error: any) {
            uiAlert.error(error.response.data.message);
        } finally {
            uiLoader.hide();
        }
    };

    const handleComplete = async () => {
        if (!executionId) return;

        uiLoader.show();
        try {
            // Convert empty string string to null for API
            const formattedOutputs = outputs.map(o => ({
                ...o,
                scrapDestinationProductId: o.scrapDestinationProductId === '' ? null : o.scrapDestinationProductId
            }));
            await manufacturingApi.transitionExecution(executionId, {
                nextStatus: ExecutionStatusEnum.COMPLETED,
                outputs: formattedOutputs
            });
            uiAlert.success("Production completed! Inventory updated.");
            onSuccess();
        } catch (error) {
            uiAlert.error("Failed to complete production");
        } finally {
            uiLoader.hide();
        }
    };

    const currentVersion = definition.versions?.find(v => v.id === selectedVersionId);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">{definition.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Process Execution • Step {step === 'VERSION' ? '1' : step === 'PLAN' ? '2' : '3'} of 3
                        </p>
                        {step !== 'VERSION' && (
                            <p className="text-[10px] text-slate-900">
                                {currentVersion?.notes || "No Notes Available"}
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
                    {step === 'VERSION' ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p className="text-xs font-medium">Multiple active recipes found. Please select which one to use for this job.</p>
                            </div>
                            <div className="space-y-3">
                                {activeVersions.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => {
                                            setSelectedVersionId(v.id);
                                            setStep('PLAN');
                                        }}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-md transition-all flex items-center justify-between group"
                                    >
                                        <div className="text-left">
                                            <p className="font-bold text-slate-900">Version #{v.versionNumber}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {v.iOs?.filter(io => io.direction === 0).length || 0} Inputs • {v.iOs?.filter(io => io.direction === 1).length || 0} Outputs • {v.costs?.length || 0} Cost Factors
                                            </p>
                                            <p className="text-[10px] text-slate-900">
                                                {v.notes || "No Notes Available"}
                                            </p>    
                                        </div>
                                        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 'PLAN' ? (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Planned Target Quantity
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={plannedQty || ''}
                                        onChange={(e) => setPlannedQty(Number(e.target.value))}
                                        className="w-full pl-6 pr-16 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all text-2xl font-black text-slate-900"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 uppercase tracking-widest">Units</span>
                                </div>
                            </div>

                            {currentVersion && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Components (Est.)</h4>
                                    <div className="space-y-3">
                                        {currentVersion.iOs?.filter(io => io.direction === 0).map(io => (
                                            <div key={io.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                                    <span className="text-slate-600 font-medium">{io.product?.name}</span>
                                                </div>
                                                <span className="font-black text-slate-900">{((io.standardQty || 0) * plannedQty).toFixed(2)} {io.uom}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {activeVersions.length > 1 && (
                                    <button
                                        onClick={() => setStep('VERSION')}
                                        className="px-6 py-4 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                                    > Back </button>
                                )}
                                <button
                                    onClick={handleStart}
                                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                                >
                                    Begin Production <ArrowRight size={18} />
                                </button>
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
                                    
                                    const outState = outputs.find(o => o.productId === io.productId);
                                    if (!outState) return null;
                                    
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
                                                            const arr = [...outputs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].actualQty = Number(e.target.value);
                                                            setOutputs(arr);
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
                                                            const arr = [...outputs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].scrapQty = Number(e.target.value);
                                                            setOutputs(arr);
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
                                                            const arr = [...outputs];
                                                            const idx = arr.findIndex(x => x.productId === io.productId);
                                                            arr[idx].scrapDestinationProductId = e.target.value;
                                                            setOutputs(arr);
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
