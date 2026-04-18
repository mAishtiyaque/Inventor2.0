import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { manufacturingApi } from '../../api/manufacturingApi';
import type { ProcessExecution } from '../../api/manufacturingApi';
import { uiLoader } from '../../store/loaderStore';
import { uiAlert } from '../../store/alertStore';
import { CostTypeLabel } from '../../api/productsApi';
import {
    Clock,
    ArrowLeft,
    CheckCircle2,
    Timer,
    AlertTriangle,
    Package,
    TrendingDown,
    TrendingUp,
    Calculator,
    Calendar,
    User,
    Coins,
    Settings2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const JobExecutionDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [execution, setExecution] = useState<ProcessExecution | null>(null);

    useEffect(() => {
        if (id) {
            loadExecution(id);
        }
    }, [id]);

    const loadExecution = async (executionId: string) => {
        uiLoader.show();
        try {
            const response = await manufacturingApi.getExecution(executionId);
            setExecution(response.data);
        } catch (e) {
            uiAlert.error("Failed to load job details");
            navigate('/manufacturing');
        } finally {
            uiLoader.hide();
        }
    };

    if (!execution) return null;

    const isCompleted = execution.status === 4;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/manufacturing"
                        className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Job #{execution.id.split('-')[0].toUpperCase()}</h2>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                isCompleted
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-blue-50 text-blue-600 border-blue-100"
                            )}>
                                {isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}
                            </span>
                        </div>
                        <p className="text-slate-600 font-medium flex items-center gap-1">
                            <Settings2 size={16} className="text-slate-400" />
                            {execution.processDefinitionVersion?.processDefinition?.name ? (
                                <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-100">
                                    {execution.processDefinitionVersion.processDefinition.name}
                                </span>
                            ) : (
                                <span className="text-sm text-slate-500">Standard Process</span>
                            )}
                            {execution.processDefinitionVersion?.id && (
                                <span className="text-xs text-slate-500">V{execution.processDefinitionVersion.versionNumber}</span>
                            )}
                        </p>
                        <p className="text-[10px] text-slate-900">
                            {execution.processDefinitionVersion?.notes || "No Notes Available"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={<TrendingUp className="text-indigo-500" />}
                    label="Planned Target"
                    value={execution.plannedQty}
                    unit="Units"
                />
                <MetricCard
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    label="Actual Output"
                    value={execution.actualOutputQty}
                    unit="Units"
                    trend={isCompleted ? (execution.actualOutputQty >= execution.plannedQty ? 'positive' : 'negative') : undefined}
                />
                <MetricCard
                    icon={<TrendingDown className="text-red-500" />}
                    label="Scrap / Loss"
                    value={execution.scrapQty}
                    unit="Units"
                    color="text-red-600"
                />
                <MetricCard
                    icon={<Calculator className="text-amber-500" />}
                    label="Efficiency"
                    value={execution.plannedQty > 0 ? Math.round((execution.actualOutputQty / execution.plannedQty) * 100) : 0}
                    unit="%"
                />
                <MetricCard
                    icon={<Coins className="text-emerald-600" />}
                    label="Total Job Cost"
                    value={execution.totalCost?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '₹0'}
                    unit=""
                    color="text-emerald-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Material IOs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Package size={18} className="text-slate-400" />
                                Material Inventory Movements
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Type</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Planned Qty</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actual Qty</th>
                                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Calculation</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actual Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {execution.iOs?.sort((a, b) => a.direction - b.direction).map((io) => (
                                        <tr key={io.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <p className="font-bold text-slate-900">{io.product?.name || 'Unknown Product'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{io.product?.code}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                                    io.direction === 0
                                                        ? "bg-amber-50 text-amber-600"
                                                        : "bg-emerald-50 text-emerald-600"
                                                )}>
                                                    {io.direction === 0 ? 'INPUT' : 'OUTPUT'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-slate-500">
                                                {io.plannedQty}
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-slate-900">
                                                {isCompleted ? io.actualQty : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold text-slate-400 text-xs">
                                                {isCompleted ? `${io.actualQty} x ₹${io.unitCost.toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-8 py-4 text-right font-black text-slate-900 scale-95 origin-right">
                                                {isCompleted ? `₹${io.actualCost?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!execution.iOs || execution.iOs.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                                                No material movements recorded for this job.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Fixed Costs Breakdown */}
                    {isCompleted && execution.costs && execution.costs.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Coins size={18} className="text-emerald-500" />
                                    Process & Fixed Costs Breakdown
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Cost Type</th>
                                            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Calculation</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {execution.costs.map((cost) => (
                                            <tr key={cost.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <p className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                                                        {CostTypeLabel[cost.costType] || 'General Cost'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {cost.quantity} Units x ₹{cost.rate.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right font-black text-slate-900 tracking-tight">
                                                    ₹{cost.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Timeline & Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Job Timeline
                        </h3>
                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            <TimelineItem
                                icon={<Calendar size={12} />}
                                label="Job Started"
                                date={execution.startedAt}
                                active
                            />
                            <TimelineItem
                                icon={<CheckCircle2 size={12} />}
                                label="Job Completed"
                                date={execution.completedAt}
                                active={isCompleted}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <User size={18} className="text-indigo-400" />
                                Execution Context
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Vendor</p>
                                    <p className="text-sm font-medium text-slate-200">{execution.vendorId || 'Internal Production'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Process Definition</p>
                                    <p className="text-sm font-medium text-slate-200">{execution.processDefinitionVersion?.id ? `Version ${execution.processDefinitionVersion.versionNumber}` : 'Default'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Timer size={120} />
                        </div>
                    </div>

                    {!isCompleted && (
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4">
                            <AlertTriangle className="text-blue-500 shrink-0" size={20} />
                            <div>
                                <h4 className="text-blue-900 font-bold text-sm mb-1">In Progress</h4>
                                <p className="text-blue-700 text-xs leading-relaxed">This job is currently active. Use the production floor to update status or record scrap.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit: string;
    trend?: 'positive' | 'negative' | 'neutral';
    color?: string;
}> = ({ icon, label, value, unit, trend, color }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                {icon}
            </div>
            {trend && (
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                    trend === 'positive' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {trend === 'positive' ? 'Target Met' : 'Under Target'}
                </span>
            )}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-black text-slate-900", color)}>{value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>
    </div>
);

const TimelineItem: React.FC<{ icon: React.ReactNode; label: string; date?: string; active?: boolean }> = ({ icon, label, date, active }) => (
    <div className={cn("flex gap-4", !active && "opacity-40 grayscale")}>
        <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2",
            active ? "bg-white border-indigo-500 text-indigo-500 shadow-sm" : "bg-slate-50 border-slate-200 text-slate-300"
        )}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-900 mb-0.5">{label}</p>
            <p className="text-[10px] text-slate-500 font-medium">
                {date ? new Date(date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Pending...'}
            </p>
        </div>
    </div>
);
