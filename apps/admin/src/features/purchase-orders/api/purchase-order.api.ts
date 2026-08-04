import { clientFetch } from '@/lib/clientFetch';
import { clientDb, ClientPurchaseOrder } from '@/lib/clientDb';
import { useAuthStore } from '@/store/authStore';

export const purchaseOrderApi = {
  // Lấy danh sách Đơn mua hàng
  getAll: async (): Promise<ClientPurchaseOrder[]> => {
    try {
      const res = await clientFetch('v1/purchase-orders');
      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result.data)) {
          return result.data;
        } else if (result.data && Array.isArray(result.data.data)) {
          return result.data.data;
        } else if (Array.isArray(result)) {
          return result;
        }
      }
    } catch (e) {
      console.warn('Backend getAll purchase-orders failed, using mock fallback', e);
    }

    return clientDb.getPurchaseOrders();
  },

  // Lấy chi tiết Đơn mua hàng
  getById: async (id: string): Promise<ClientPurchaseOrder | null> => {
    try {
      const res = await clientFetch(`v1/purchase-orders/${id}`);
      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
    } catch (e) {
      console.warn('Backend getById purchase-order failed, using mock fallback', e);
    }

    const data = clientDb.getPurchaseOrders().find(p => p.id === id);
    return data || null;
  },

  // Tạo mới Đơn mua hàng (PO)
  create: async (data: any): Promise<ClientPurchaseOrder> => {
    try {
      const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const defaultPoCode = `PO-${nowStr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        poCode: data.code || data.poCode || defaultPoCode,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        expectedDeliveryDate: data.expectedDeliveryDate 
          ? new Date(data.expectedDeliveryDate).toISOString() 
          : undefined,
        note: data.note || '',
        items: (data.items || []).map((item: any) => ({
          skuId: item.skuId,
          orderQuantity: Number(item.orderedQuantity ?? item.orderQuantity ?? 1),
          unitPrice: Number(item.unitPrice ?? 0),
          note: item.note || ''
        }))
      };

      const res = await clientFetch('v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson?.validationErrors) {
          const detail = Object.values(errJson.validationErrors).join(', ');
          throw new Error(detail);
        }
        if (errJson?.message) {
          throw new Error(errJson.message);
        }
      }
    } catch (e: any) {
      if (e?.message && e.message !== 'Failed to fetch') {
        throw e;
      }
      console.warn('Backend create purchase-order failed, using mock fallback', e);
    }

    return clientDb.savePurchaseOrder(data);
  },

  // Cập nhật Đơn mua hàng (PO)
  update: async (id: string, data: any): Promise<ClientPurchaseOrder> => {
    try {
      const payload = {
        poCode: data.code || data.poCode,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        expectedDeliveryDate: data.expectedDeliveryDate 
          ? new Date(data.expectedDeliveryDate).toISOString() 
          : undefined,
        note: data.note || '',
        status: data.status,
        items: (data.items || []).map((item: any) => ({
          skuId: item.skuId,
          orderQuantity: Number(item.orderedQuantity ?? item.orderQuantity ?? 1),
          unitPrice: Number(item.unitPrice ?? 0),
          note: item.note || ''
        }))
      };

      const res = await clientFetch(`v1/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson?.validationErrors) {
          const detail = Object.values(errJson.validationErrors).join(', ');
          throw new Error(detail);
        }
        if (errJson?.message) {
          throw new Error(errJson.message);
        }
      }
    } catch (e: any) {
      if (e?.message && e.message !== 'Failed to fetch') {
        throw e;
      }
      console.warn('Backend update purchase-order failed', e);
    }

    return clientDb.savePurchaseOrder({ ...data, id });
  },

  // Cập nhật trạng thái Đơn mua hàng (PO)
  updateStatus: async (id: string, status: string): Promise<ClientPurchaseOrder> => {
    try {
      // First fetch current PO to build request payload with updated status
      const currentPo = await purchaseOrderApi.getById(id);
      if (currentPo) {
        return await purchaseOrderApi.update(id, { ...currentPo, status });
      }
    } catch (e) {
      console.warn('Backend updateStatus purchase-order failed', e);
    }
    return clientDb.savePurchaseOrder({ id, status } as any);
  },
};
