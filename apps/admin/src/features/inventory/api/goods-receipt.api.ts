import { clientFetch } from '@/lib/clientFetch';
import { clientDb, ClientGoodsReceipt } from '@/lib/clientDb';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/constants/errorMessages';

export const goodsReceiptApi = {
  // Lấy danh sách phiếu nhập kho
  getAll: async (): Promise<ClientGoodsReceipt[]> => {
    try {
      const res = await clientFetch('v1/goods-receipts');
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem danh sách phiếu nhập kho', 403);
      }
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
      if (e instanceof ApiError && e.status === 403) {
        throw e;
      }
      console.warn('Backend getAll goods-receipts failed, using mock fallback', e);
    }

    return clientDb.getGoodsReceipts();
  },

  // Lấy chi tiết phiếu nhập kho
  getById: async (id: string): Promise<ClientGoodsReceipt | null> => {
    try {
      const res = await clientFetch(`v1/goods-receipts/${id}`);
      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
    } catch (e) {
      console.warn('Backend getById goods-receipt failed, using mock fallback', e);
    }

    const data = clientDb.getGoodsReceipts().find(r => r.id === id);
    return data || null;
  },

  // Tạo mới phiếu nhập kho
  create: async (data: any): Promise<ClientGoodsReceipt> => {
    try {
      const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const defaultReceiptCode = `GR-${nowStr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const formatToLocalDateTime = (dateStr?: string) => {
        if (!dateStr) return null;
        return dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
      };

      const payload = {
        receiptCode: data.receiptCode || defaultReceiptCode,
        purchaseOrderId: data.purchaseOrderId || null,
        warehouseId: data.warehouseId,
        note: data.note || '',
        items: (data.items || []).map((item: any) => ({
          skuId: item.skuId,
          quantity: Number(item.quantity || 1),
          unitCost: Number(item.unitCost || 0),
          batchCode: item.batchCode || '',
          manufactureDate: formatToLocalDateTime(item.manufactureDate),
          expiryDate: formatToLocalDateTime(item.expiryDate),
        }))
      };

      const res = await clientFetch('v1/goods-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        // Giữ đồng bộ local storage cho mock
        clientDb.saveGoodsReceipt(data);
        return result.data || result;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson?.validationErrors) {
          const detail = Object.values(errJson.validationErrors).join(', ');
          throw new ApiError(errJson.code, detail, res.status, errJson);
        }
        throw new ApiError(errJson.code, errJson?.message || 'Tạo phiếu nhập kho thất bại', res.status, errJson);
      }
    } catch (e: any) {
      if (e instanceof ApiError || (e?.message && e.message !== 'Failed to fetch')) {
        throw e;
      }
      console.warn('Backend create goods-receipt failed, using mock fallback', e);
    }

    return clientDb.saveGoodsReceipt(data);
  },

  // Xác nhận phiếu nhập kho (RECEIVED - tăng tồn kho)
  confirm: async (id: string): Promise<ClientGoodsReceipt> => {
    try {
      const res = await clientFetch(`v1/goods-receipts/${id}/confirm`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson?.message || 'Xác nhận phiếu nhập kho thất bại', res.status, errJson);
    } catch (e: any) {
      if (e instanceof ApiError || (e?.message && e.message !== 'Failed to fetch')) {
        throw e;
      }
      console.warn('Backend confirm goods-receipt failed, using mock fallback', e);
    }
    return clientDb.saveGoodsReceipt({ id, status: 'RECEIVED' } as any);
  },

  // Cập nhật trạng thái phiếu nhập kho
  updateStatus: async (id: string, status: string): Promise<ClientGoodsReceipt> => {
    try {
      const res = await clientFetch(`v1/goods-receipts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson?.message || 'Cập nhật trạng thái phiếu nhập kho thất bại', res.status, errJson);
    } catch (e: any) {
      if (e instanceof ApiError || (e?.message && e.message !== 'Failed to fetch')) {
        throw e;
      }
      console.warn('Backend updateStatus goods-receipt failed, using mock fallback', e);
    }
    return clientDb.saveGoodsReceipt({ id, status } as any);
  },
};
