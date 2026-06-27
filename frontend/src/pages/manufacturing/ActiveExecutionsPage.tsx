import React, { useEffect, useState } from 'react';
import { manufacturingApi } from '../../api/manufacturingApi';
import type { ProcessExecution, ProcessDefinition } from '../../api/manufacturingApi';
import { uiLoader } from '../../store/loaderStore';
import { uiAlert } from '../../store/alertStore';
import { Clock, Activity, ArrowRight, Play, CheckCircle2, Timer, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ExecutionFlow } from '../../components/ExecutionFlow';

export const ActiveExecutionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [executions, setExecutions] = useState<ProcessExecution[]>([]);
    const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
    const [selectedDef, setSelectedDef] = useState<ProcessDefinition | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        uiLoader.show();
        try {
            const [execs, defs] = await Promise.all([
                manufacturingApi.getExecutions(),
                manufacturingApi.getDefinitions()
            ]);
            setExecutions(execs.data);
            setDefinitions(defs.data);
        } catch (e) {
            uiAlert.error("Failed to load production floor data");
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Production Floor</h2>
                    <p className="text-slate-500 font-medium">Monitor active production runs and execute new jobs.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 rounded-2xl p-1 px-4 flex items-center gap-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{executions.filter(e => e.status !== 4).length} Active</span>
                        </div>
                        <div className="w-px h-4 bg-slate-100"></div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{executions.filter(e => e.status === 4).length} Done</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Activity size={14} />
                        Active Job Orders
                    </h3>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Status</th>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Process Definition</th>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty / Output</th>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right hidden lg:table-cell">Scrap / Cost</th>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">Progress</th>
                                    <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {executions.map((exec) => (
                                    <tr
                                        key={exec.id}
                                        onClick={() => navigate(`/manufacturing/executions/${exec.id}`)}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-2">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
                                                    exec.status === 4
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                )}>
                                                    {exec.status === 4 ? <CheckCircle2 size={20} /> : <Timer size={20} />}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                                    {exec.id.split('-')[0].toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight">
                                                    {exec.processDefinitionVersion?.processDefinition?.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                                    V{exec.processDefinitionVersion?.versionNumber}
                                                    {exec.vendor?.name && (
                                                        <span className="text-indigo-500 normal-case not-italic ml-1">
                                                            · {exec.vendor.name}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                                                    <Package size={12} className="text-slate-400" />
                                                    {exec.plannedQty}
                                                </div>
                                                {exec.status === 4 ? <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">
                                                    Out: {exec.actualOutputQty}
                                                </div> : <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter mt-0.5">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right hidden lg:table-cell">
                                            <div className="flex flex-col items-end">
                                                {exec.scrapQty > 0 ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-black text-red-500">
                                                        <Trash2 size={12} />
                                                        {exec.scrapQty}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 font-bold italic">No Scrap</span>
                                                )}
                                                {exec.status === 4 && exec.totalCost > 0 ? (
                                                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mt-0.5">
                                                        ₹{exec.totalCost.toLocaleString('en-IN')}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter mt-0.5">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black text-slate-900 tabular-nums w-8 text-right">
                                                    {exec.status === 4 ? '100' : '50'}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const def = definitions.find(d => d.versions?.some(v => v.id === exec.processDefinitionVersionId));
                                                    if (def) setSelectedDef(def);
                                                }}
                                                className={cn(
                                                    "inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all border shadow-sm group/btn",
                                                    exec.status === 4
                                                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                                                        : "bg-white text-indigo-600 border-slate-200 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white hover:shadow-indigo-100 active:scale-90"
                                                )}
                                                disabled={exec.status === 4}
                                            >
                                                {exec.status === 4 ? <Package size={18} className="opacity-40" /> : <ArrowRight size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {executions.length === 0 && (
                            <div className="py-20 text-center border-t border-slate-100">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl text-slate-300 mb-4 border border-slate-100 shadow-inner">
                                    <Clock size={32} />
                                </div>
                                <p className="text-slate-400 font-bold tracking-tight uppercase text-[10px]">No active production runs found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Play size={20} className="text-indigo-500" />
                            Start New Job
                        </h3>
                        <div className="space-y-4">
                            {definitions.slice(0, 5).map((def) => (
                                <button
                                    key={def.id}
                                    onClick={() => setSelectedDef(def)}
                                    className="w-full text-left p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md transition-all flex items-center justify-between group"
                                >
                                    <div className="flex flex-col">
                                        <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight mb-1">{def.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">{def.versions?.filter(v => v.status === 0).length || 0} Ready Recipes</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">Ledger-DRIVEN</h4>
                            <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">All material movements are automatically recorded in the inventory ledger upon job completion.</p>
                            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Audit Status</p>
                                <p className="text-[10px] font-medium text-slate-300">Compliant with ERP-Grade Standards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedDef && (
                <ExecutionFlow
                    definition={selectedDef}
                    initialExecutionId={executions.find(e => e.status !== 4 &&
                        selectedDef.versions?.some(v => v.id === e.processDefinitionVersionId))?.id}
                    onCancel={() => setSelectedDef(null)}
                    onSuccess={() => {
                        setSelectedDef(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};
