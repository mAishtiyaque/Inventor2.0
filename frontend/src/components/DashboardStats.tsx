import React, { useEffect, useState } from 'react';
import { reportingApi } from '../api/reportingApi';
import type { DashboardSummary } from '../api/reportingApi';
import { uiAlert } from '../store/alertStore';

export const DashboardStats: React.FC = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const response = await reportingApi.getDashboardSummary();
            setSummary(response.data);
        } catch (error) {
            uiAlert.error("Failed to load dashboard metrics");
        }
    };

    if (!summary) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Valuation Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Inventory Value</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-bold text-slate-900">
                        ${summary.totalInventoryValue.toLocaleString()}
                    </h4>
                </div>
            </div>

            {/* Product Type Breakdown */}
            {summary.valuations.map((v) => (
                <div key={v.productType} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">{v.productType} Valuation</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-bold text-slate-900">${v.totalValue.toLocaleString()}</h4>
                        <span className="text-xs text-slate-400">{v.totalQuantity} units</span>
                    </div>
                </div>
            ))}

            {/* Efficiency Overview (Simplified) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Avg. Efficiency</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-bold text-slate-900">
                        {summary.efficiencies.length > 0
                            ? (summary.efficiencies.reduce((a, b) => a + b.efficiencyPercentage, 0) / summary.efficiencies.length).toFixed(1)
                            : 0}%
                    </h4>
                </div>
            </div>
        </div>
    );
};
