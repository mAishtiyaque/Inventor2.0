import { apiClient } from './apiClient';

//export type ProductType = 'RAW' | 'WIP' | 'FG' | 'SCRAP';
export type ProductType = 0 | 1 | 2 | 3

export const ProductTypeLabel: Record<ProductType, string> = {
  0: 'Raw Material',
  1: 'Work In Progress',
  2: 'Finished Good',
  3: 'Scrap',
};

//export type CostType = 'MATERIAL' | 'LABOR' | 'MACHINE' | 'ELECTRICITY' | 'PACKAGING' | 'TRANSPORT' | 'OVERHEAD';
export type CostType = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const CostTypeValues: CostType[] = [0, 1, 2, 3, 4, 5, 6];

export const CostTypeLabel: Record<CostType, string> = {
  0: 'Material',
  1: 'Labor',
  2: 'Machine',
  3: 'Electricity',
  4: 'Packaging',
  5: 'Transport',
  6: 'Overhead'
};

//export type PriceType = 'WHOLESALE' | 'RETAIL' | 'DISTRIBUTOR' | 'EXPORT';
export type PriceType = 0 | 1 | 2 | 3

export const PriceTypeLabel: Record<PriceType, string> = {
  0: 'Wholesale',
  1: 'Retail',
  2: 'Distributor',
  3: 'Export'
};
// 0: Active, 1: Inactive
export type VersionStatus = 0 | 1

// 0: IN, 1: OUT
export type DirectionType = 0 | 1

export interface ProductCost {
    id: string;
    costType: CostType;
    amount: number;
    uom?: string;
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;
    notes?: string;
    createdAt: string;
}

export interface ProductPrice {
    id: string;
    priceType: PriceType;
    amount: number;
    currency?: string;
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;
    notes?: string;
    createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  productType: ProductType;
  uom: string;
  currentQuantity: number;
  costs?: ProductCost[];
  prices?: ProductPrice[];
}

export const productsApi = {
  getProducts: () => apiClient.get<Product[]>('/products'),
  getProduct: (id: string) => apiClient.get<Product>(`/products/${id}`),
  createProduct: (data: Partial<Product>) => apiClient.post<Product>('/products', data),
  updateProduct: (id: string, data: Partial<Product>) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/products/${id}`),
  searchProducts: (query: string) => apiClient.get<Product[]>(`/products/search?query=${query}`),

  // Cost Management
  getProductCostHistory: (productId: string, costType?: CostType) => apiClient.get<ProductCost[]>(`/products/${productId}/costs`, { params: { costType } }),
  addProductCost: (productId: string, data: Partial<ProductCost>) => apiClient.post<ProductCost>(`/products/${productId}/costs`, data),
  updateProductCost: (productId: string, costType: CostType, data: Partial<ProductCost>) => apiClient.put<ProductCost>(`/products/${productId}/costs/${costType}`, data),
  removeProductCost: (productId: string, costType: CostType) => apiClient.delete(`/products/${productId}/costs/${costType}`),

  // Price Management
  getProductPriceHistory: (productId: string, priceType?: PriceType) => apiClient.get<ProductPrice[]>(`/products/${productId}/prices`, { params: { priceType } }),
  addProductPrice: (productId: string, data: Partial<ProductPrice>) => apiClient.post<ProductPrice>(`/products/${productId}/prices`, data),
  updateProductPrice: (productId: string, priceType: PriceType, data: Partial<ProductPrice>) => apiClient.put<ProductPrice>(`/products/${productId}/prices/${priceType}`, data),
  removeProductPrice: (productId: string, priceType: PriceType) => apiClient.delete(`/products/${productId}/prices/${priceType}`),
};
