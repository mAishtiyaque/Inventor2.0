import { apiClient } from './apiClient';

export interface ValuationMetric {
  productType: string;
  totalQuantity: number;
  totalValue: number;
}

export interface EfficiencyMetric {
  processName: string;
  plannedQty: number;
  actualQty: number;
  efficiencyPercentage: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  status: string;
  color: 'emerald' | 'orange' | 'blue';
}

export interface StockAlert {
  name: string;
  type: string;
  recommendation: number;
  stock: number;
}

export interface DashboardSummary {
  totalJobOrders: number;
  totalOutstandingAmount: number;
  finishedGoodsCount: number;
  rawMaterialStockCount: number;
  valuations: ValuationMetric[];
  efficiencies: EfficiencyMetric[];
  recentActivities: RecentActivity[];
  stockAlerts: StockAlert[];
  totalInventoryValue: number;
}

export const reportingApi = {
  getDashboardSummary: () => apiClient.get<DashboardSummary>('/reporting/dashboard-summary'),
};
