import { apiClient } from './apiClient';
import type { Product, CostType, VersionStatus, DirectionType } from './productsApi';

export type ProcessIODefinition = {
  id: string;
  productId: string;
  product: Product;
  direction: DirectionType; // 0: Input, 1: Output
  standardQty: number;
  uom: string;
};

export type ProcessCostDefinition = {
  id: string;
  costType: CostType;
  rate: number;
  uom: string;
};


export type ProcessDefinitionVersion = {
  id: string;
  versionNumber: number;
  status: VersionStatus;
  processDefinitionId: string;
  processDefinition?: ProcessDefinition;
  isUsed: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  notes: string;
  iOs: ProcessIODefinition[];
  costs: ProcessCostDefinition[];
};

export type ProcessDefinition = {
  id: string;
  name: string;
  description?: string;
  versions?: ProcessDefinitionVersion[];
};

export type ExecutionStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const ExecutionStatusEnum = {
  DRAFT: 0,
  PLANNED: 1,
  RESERVED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CLOSED: 5,
  CANCELLED: 6,
  FAILED: 7,
  COMPLETED_WITH_LOSS: 8
} as const;

export type ProcessExecutionIO = {
  id: string;
  processExecutionId: string;
  productId: string;
  product?: Product;
  direction: DirectionType;
  plannedQty: number;
  actualQty: number;
  unitCost: number;
  actualCost: number;
};

export type ProcessExecutionCost = {
  id: string;
  costType: CostType;
  rate: number;
  quantity: number;
  totalCost: number;
};

export type ProcessExecution = {
  id: string;
  processDefinitionVersionId: string;
  processDefinitionVersion?: ProcessDefinitionVersion;
  status: ExecutionStatus;
  plannedQty: number;
  actualOutputQty: number;
  scrapQty: number;
  totalCost: number;
  startedAt: string;
  completedAt?: string;
  vendorId?: string;
  vendor?: any;
  iOs?: ProcessExecutionIO[];
  costs?: ProcessExecutionCost[];
};

export type OutIOsDeclaration = {
  productId: string;
  actualQty: number;
  scrapQty: number;
  scrapDestinationProductId?: string | null;
};

export const manufacturingApi = {
  getDefinitions: () => apiClient.get<ProcessDefinition[]>('/manufacturing/definitions'),
  getDefinition: (id: string) => apiClient.get<ProcessDefinition>(`/manufacturing/definitions/${id}`),
  createDefinition: (data: { name: string; description?: string }) => 
    apiClient.post<ProcessDefinition>('/manufacturing/definitions', data),
  
  createVersion: (definitionId: string, data: any) => 
    apiClient.post(`/manufacturing/definitions/${definitionId}/versions`, data),
    
  updateVersion: (definitionId: string, versionId: string, data: any) =>
    apiClient.put(`/manufacturing/definitions/${definitionId}/versions/${versionId}`, data),

  deleteVersion: (definitionId: string, versionId: string) =>
    apiClient.delete<string>(`/manufacturing/definitions/${definitionId}/versions/${versionId}`),
    
  retireVersion: (definitionId: string, versionId: string) =>
    apiClient.post<ProcessDefinitionVersion>(`/manufacturing/definitions/${definitionId}/versions/${versionId}/retire`),
    
  getExecutions: () => apiClient.get<ProcessExecution[]>('/manufacturing/executions'),
  getExecution: (id: string) => apiClient.get<ProcessExecution>(`/manufacturing/executions/${id}`),
  createExecution: (data: { 
    processDefinitionVersionId: string; 
    plannedQty: number; 
    vendorId?: string | null; 
    iOs?: { productId: string; direction: number; plannedQty: number; unitCost: number }[];
    costs?: { costType: number; rate: number; quantity: number }[];
  }) => 
    apiClient.post<ProcessExecution>('/manufacturing/executions', data),
    
  transitionExecution: (id: string, request: { nextStatus: ExecutionStatus; outIOs?: OutIOsDeclaration[]; notes?: string }) => 
    apiClient.post<ProcessExecution>(`/manufacturing/executions/${id}/transition`, request),
};
