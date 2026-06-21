import { apiClient } from "./apiClient";

export type Vendor = {
  id: string;
  code: string;
  name: string;
  vendorType: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
};

export const vendorApi = {
  getBrokers: (includeInactive = false) =>
    apiClient.get<Vendor[]>(`/vendors?includeInactive=${includeInactive}`),
  getBroker: (id: string) => apiClient.get<Vendor>(`/vendors/${id}`),
  createBroker: (body: Partial<Vendor>) =>
    apiClient.post<Vendor>("/vendors", body),
  updateBroker: (id: string, body: Partial<Vendor>) =>
    apiClient.put<Vendor>(`/vendors/${id}`, body),
  deleteBroker: (id: string) => apiClient.delete<void>(`/vendors/${id}`),
};

export default vendorApi;
