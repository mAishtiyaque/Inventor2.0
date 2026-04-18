import { apiClient } from './apiClient';
import type { DirectionType } from './productsApi';

export interface LedgerEntry {
  id: string;
  productName: string;
  direction: DirectionType;
  quantity: number;
  uom: string;
  unitCost: number;
  eventType: string;
  createdAt: string;
}

export const inventoryApi = {
  getLedger: () => apiClient.get<LedgerEntry[]>('/inventory/ledger'),
};
