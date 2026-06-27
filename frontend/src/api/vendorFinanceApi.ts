import { apiClient } from "./apiClient";

export type VendorTransaction = {
  id: string;
  transactionType: number;
  amount: number;
  currency?: string;
  transactionDate: string;
  reference?: string;
  notes?: string;
};

export type VendorBalance = {
  balance: number;
  currency: string;
};

export const vendorFinanceApi = {
  getBalance: (vendorId: string) =>
    apiClient.get<VendorBalance>(`/vendors/${vendorId}/finance/balance`),
  getTransactions: (vendorId: string, params?: any) =>
    apiClient.get<VendorTransaction[]>(
      `/vendors/${vendorId}/finance/transactions`,
      { params },
    ),
  createTransaction: (vendorId: string, body: any) =>
    apiClient.post<VendorTransaction>(
      `/vendors/${vendorId}/finance/transactions`,
      body,
    ),
  updateTransaction: (vendorId: string, txId: string, body: any) =>
    apiClient.put<VendorTransaction>(
      `/vendors/${vendorId}/finance/transactions/${txId}`,
      body,
    ),
  deleteTransaction: (vendorId: string, txId: string) =>
    apiClient.delete<void>(`/vendors/${vendorId}/finance/transactions/${txId}`),
};

export default vendorFinanceApi;
