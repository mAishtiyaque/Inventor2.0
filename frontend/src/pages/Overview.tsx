import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Package2,
    Boxes,
    ArrowUpRight,
    AlertCircle,
    Activity,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { reportingApi } from '../api/reportingApi';
import { type DashboardSummary } from '../api/reportingApi';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie,
    LabelList
} from 'recharts';
import { uiAlert } from '../store/alertStore';

export const Overview: React.FC = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await reportingApi.getDashboardSummary();
                setData(response.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
                uiAlert.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
                {/* <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={24} />
                </div> */}
                <div className="bg-white/50 backdrop-blur-[1px]">
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Initializing enterprise data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sync Error</h3>
                <p className="text-slate-500 max-w-md">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-wider">Live System</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Executive Dashboard</h2>
                    <p className="text-slate-500 font-medium text-lg">Real-time operational intelligence and inventory insights.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search intelligence..." 
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <Activity size={20} className="text-slate-600" />
                    </button>
                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
                        Download Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Job Orders"
                    value={data?.totalJobOrders.toString() || "0"}
                    icon={BarChart3}
                    trend="+12%"
                    color="blue"
                    description="Processes registered"
                />
                <StatCard
                    title="Inventory Valuation"
                    value={`₹${data?.totalInventoryValue.toLocaleString() || "0"}`}
                    icon={TrendingUp}
                    trend="Stable"
                    color="indigo"
                    description="Current stock value"
                />
                <StatCard
                    title="Finished Goods"
                    value={`${data?.finishedGoodsCount || 0} Units`}
                    icon={Package2}
                    trend="+2.5%"
                    color="emerald"
                    description="Ready for dispatch"
                />
                <StatCard
                    title="Raw Material"
                    value={`${data?.rawMaterialStockCount || 0} Units`}
                    icon={Boxes}
                    trend="-15%"
                    color="orange"
                    description="Stock replenishment"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Efficiency Analytics</h3>
                            <p className="text-sm text-slate-500 font-medium">Production output vs. planned targets</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-0 cursor-pointer">
                            <option>Last 7 Processes</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.efficiencies || []}>
                                <defs>
                                    <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="processName" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="actualQty" 
                                    name="Actual Output"
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorQty)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="plannedQty" 
                                    name="Planned Target"
                                    stroke="#e2e8f0" 
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Inventory Mix</h3>
                    <p className="text-sm text-slate-500 font-medium mb-8">Value distribution by type</p>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.valuations || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="totalValue"
                                    nameKey="productType"
                                >
                                    {(data?.valuations || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="productType" position="insideEnd" />
                                </Pie>
                                <Tooltip 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {(data?.valuations || []).map((v, i) => (
                            <div key={v.productType} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{v.productType}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">₹{v.totalValue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Recent Operational Activity</h3>
                            <p className="text-xs text-slate-500 font-medium">Latest manufacturing processes and transfers</p>
                        </div>
                        <button className="group flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
                            View Ledger <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {data?.recentActivities.map((activity) => (
                            <ActivityItem
                                key={activity.id}
                                id={activity.id}
                                title={activity.title}
                                desc={activity.description}
                                status={activity.status}
                                color={activity.color as any}
                            />
                        ))}
                        {data?.recentActivities.length === 0 && (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="text-slate-300" size={24} />
                                </div>
                                <p className="text-slate-400 font-medium text-sm">No recent activity detected</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Intelligence Alerts</h3>
                                <p className="text-xs text-slate-500 font-medium">Critical stock levels requiring attention</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 uppercase">
                            {data?.stockAlerts.length || 0} Alerts
                        </span>
                    </div>

                    <div className="space-y-6">
                        {data?.stockAlerts.map((alert) => (
                            <AlertItem
                                key={alert.name}
                                name={alert.name}
                                type={alert.type}
                                recommendation={`${alert.recommendation}+`}
                                stock={alert.stock.toString()}
                            />
                        ))}
                        {data?.stockAlerts.length === 0 && (
                            <div className="py-12 text-center text-slate-400 font-medium">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package2 size={24} />
                                </div>
                                <p className="text-sm">All stock levels are optimal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string;
    icon: any;
    trend: string;
    color: 'blue' | 'indigo' | 'emerald' | 'orange';
    description: string;
}> = ({ title, value, icon: Icon, trend, color, description }) => {
    const colors = {
        blue: "text-blue-600 bg-blue-50/50 group-hover:bg-blue-600 group-hover:text-white",
        indigo: "text-indigo-600 bg-indigo-50/50 group-hover:bg-indigo-600 group-hover:text-white",
        emerald: "text-emerald-600 bg-emerald-50/50 group-hover:bg-emerald-600 group-hover:text-white",
        orange: "text-orange-600 bg-orange-50/50 group-hover:bg-orange-600 group-hover:text-white",
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3.5 rounded-2xl transition-all duration-500", colors[color])}>
                    <Icon size={26} strokeWidth={2.5} />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
                    trend.includes('+') ? "text-emerald-600 bg-emerald-50" : "text-slate-500 bg-slate-50"
                )}>
                    {trend}
                    <ArrowUpRight size={12} strokeWidth={3} className={cn(trend.includes('+') ? "" : "rotate-90")} />
                </div>
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h4 className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">{value}</h4>
                <p className="text-[11px] text-slate-400 font-bold group-hover:text-slate-500 transition-colors uppercase tracking-tight">{description}</p>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                <Icon size={120} strokeWidth={1} />
            </div>
        </div>
    );
};

const ActivityItem: React.FC<{
    id: string;
    title: string;
    desc: string;
    status: string;
    color: 'emerald' | 'orange' | 'blue';
}> = ({ id, title, desc, status, color }) => {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20",
        orange: "bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100/20",
        blue: "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/20",
    };

    return (
        <div className="flex items-center gap-5 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-slate-50 transition-all">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-blue-100 group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-tight">{id}</span>
            </div>
            <div className="flex-1">
                <h5 className="text-base font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{title}</h5>
                <p className="text-xs text-slate-500 font-semibold">{desc}</p>
            </div>
            <span className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black border tracking-widest uppercase shadow-sm",
                colors[color]
            )}>
                {status}
            </span>
        </div>
    );
};

const AlertItem: React.FC<{
    name: string;
    type: string;
    recommendation: string;
    stock: string
}> = ({ name, type, recommendation, stock }) => {
    return (
        <div className="flex items-center gap-5 group p-2 -m-2 rounded-2xl hover:bg-red-50/30 transition-all">
            <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse"></div>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="flex-1">
                <h5 className="text-base font-bold text-slate-800 leading-tight mb-1">{name}</h5>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">{type}</span>
                    <span className="text-xs text-slate-400 font-bold">Rec: {recommendation}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-slate-900 leading-none mb-1">{stock}</p>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Urgent</p>
            </div>
        </div>
    );
};
