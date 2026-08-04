import { clientFetch } from '@/lib/clientFetch';
import { clientDb } from '@/lib/clientDb';

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
  quantityBefore: number;
  quantityChanged: number;
  quantityAfter: number;
  referenceId?: string;
  referenceType?: string;
  note?: string;
  createdAt: string;
  createdBy?: string;
}

export const inventoryApi = {
  // Lấy mức tồn kho hiện tại (Stock)
  getStocks: async (): Promise<InventoryItemResponse[]> => {
    try {
      const res = await clientFetch('v1/inventory');
      if (res.ok) {
        const result = await res.json();
        let items: any[] = [];
        if (Array.isArray(result.data)) {
          items = result.data;
        } else if (result.data && Array.isArray(result.data.data)) {
          items = result.data.data;
        } else if (result.data && Array.isArray(result.data.content)) {
          items = result.data.content;
        } else if (Array.isArray(result.content)) {
          items = result.content;
        } else if (Array.isArray(result)) {
          items = result;
        }

        if (items.length > 0) {
          return items.map((item: any) => ({
            ...item,
            id: item.id?.toString(),
            warehouseId: item.warehouseId?.toString(),
            skuId: item.skuId?.toString(),
          }));
        }
      }
    } catch (e) {
      console.warn('Backend getStocks failed, using mock fallback', e);
    }

    return clientDb.getStockItems() as any;
  },

  // Thao tác điều chỉnh tồn kho thủ công
  adjustStock: async (data: { warehouseId: string; skuId: string; batchCode?: string; quantityDelta: number; reason?: string }) => {
    try {
      const res = await clientFetch('v1/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
    } catch (e) {
      console.warn('Backend adjustStock failed, using clientDb fallback', e);
    }

    return clientDb.addLedgerEntry({
      skuName: 'Điều chỉnh tồn kho',
      warehouseName: 'Kho hàng',
      type: 'ADJUSTMENT',
      quantityChange: data.quantityDelta,
      balanceAfter: 0,
      referenceCode: 'ADJ-' + Date.now()
    });
  },

  // Lấy sổ nhật ký biến động kho (Ledger)
  getLedgers: async (): Promise<InventoryLedgerItemResponse[]> => {
    try {
      const res = await clientFetch('v1/inventory/ledgers');
      if (res.ok) {
        const result = await res.json();
        let items: any[] = [];
        if (Array.isArray(result.data)) {
          items = result.data;
        } else if (result.data && Array.isArray(result.data.data)) {
          items = result.data.data;
        } else if (result.data && Array.isArray(result.data.content)) {
          items = result.data.content;
        } else if (Array.isArray(result.content)) {
          items = result.content;
        } else if (Array.isArray(result)) {
          items = result;
        }

        if (items.length > 0) {
          return items.map((item: any) => ({
            ...item,
            id: item.id?.toString(),
            warehouseId: item.warehouseId?.toString(),
            skuId: item.skuId?.toString(),
          }));
        }
      }
    } catch (e) {
      console.warn('Backend getLedgers failed, using mock fallback', e);
    }

    return clientDb.getLedger() as any;
  }
};
