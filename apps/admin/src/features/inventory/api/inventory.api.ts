import { ApiError } from '@/constants/errorMessages';
import { clientFetch } from '@/lib/clientFetch';
import { warehouseList, warehouseRequest } from './warehouse-request';

export interface InventoryItemResponse {
  id: string;
  warehouseId: string;
  warehouseName: string;
  skuId: string;
  skuCode: string;
  productName: string;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
  quantityOnHand: number;
  quantityLocked: number;
  costPrice?: number;
  sellingPrice?: number;
  price?: number;
  updatedAt?: string;
}

export interface InventoryLedgerItemResponse {
  id: string;
  inventoryId?: string;
  warehouseId: string;
  warehouseName: string;
  skuId: string;
  skuCode: string;
  productName: string;
  batchCode?: string;
  transactionType: string;
  quantityChange: number;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: string;
  note?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StockAdjustment {
  warehouseId: string;
  skuId: string;
  batchCode?: string;
  quantityDelta: number;
  reason?: string;
  expectedQuantityOnHand?: number;
}

export interface StockExportFilters {
  readonly warehouseId?: string;
  readonly keyword?: string;
  readonly stockStatus?: string;
  readonly sort?: string;
}

export const inventoryApi = {
  exportStocks: async (filters: StockExportFilters): Promise<Blob> => {
    const query = new URLSearchParams();
    if (filters.warehouseId && filters.warehouseId !== 'all') { query.set('warehouseId', filters.warehouseId); }
    if (filters.keyword?.trim()) { query.set('keyword', filters.keyword.trim()); }
    if (filters.stockStatus && filters.stockStatus !== 'all') { query.set('stockStatus', filters.stockStatus); }
    query.set('sort', filters.sort || 'sku,asc');
    const response = await clientFetch(`v1/inventory/stocks/export?${query}`, { skipToast: true });
    if (!response.ok) {
      const result: { code?: string; message?: string } = await response.json();
      throw new ApiError(result.code || 'INVENTORY_EXPORT_FAILED', result.message || 'Không thể xuất tồn kho', response.status, result);
    }
    if (!response.headers.get('content-type')?.includes('spreadsheetml.sheet')) {
      throw new Error('Máy chủ không trả về file Excel hợp lệ');
    }
    return response.blob();
  },
  getStocks: async (): Promise<InventoryItemResponse[]> => warehouseList<InventoryItemResponse>('v1/inventory/stocks'),
  getStocksByProduct: async (productId: string): Promise<InventoryItemResponse[]> => warehouseList<InventoryItemResponse>(`v1/inventory/stocks?productId=${encodeURIComponent(productId)}`),
  getLedgers: async (): Promise<InventoryLedgerItemResponse[]> => warehouseList<InventoryLedgerItemResponse>('v1/inventory/ledgers'),
  adjustStock: async (data: StockAdjustment): Promise<InventoryItemResponse> => warehouseRequest<InventoryItemResponse>('v1/inventory/adjust', 'POST', {
    warehouseId: data.warehouseId, skuId: data.skuId, batchCode: data.batchCode || '', quantityChange: data.quantityDelta, note: data.reason, expectedQuantityOnHand: data.expectedQuantityOnHand,
  }),
};
