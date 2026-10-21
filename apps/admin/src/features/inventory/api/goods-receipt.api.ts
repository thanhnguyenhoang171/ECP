import { warehouseList, warehouseRequest } from './warehouse-request';
import type { ClientGoodsReceipt } from '../types/inventory.types';
import type { GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';

const normalize = (receipt: ClientGoodsReceipt): ClientGoodsReceipt => ({ ...receipt, totalItems: receipt.items.length,
  items: receipt.items.map((item) => ({ ...item, skuName: item.productName || item.skuCode })) });
const payload = (data: GoodsReceiptFormValues): unknown => ({ ...data, purchaseOrderId: data.purchaseOrderId || null,
  items: data.items.map((item) => ({ ...item, manufactureDate: item.manufactureDate ? `${item.manufactureDate.slice(0, 10)}T00:00:00` : null,
    expiryDate: item.expiryDate ? `${item.expiryDate.slice(0, 10)}T00:00:00` : null })) });

export const goodsReceiptApi = {
  getAll: async (): Promise<ClientGoodsReceipt[]> => (await warehouseList<ClientGoodsReceipt>('v1/goods-receipts')).map(normalize),
  getById: async (id: string): Promise<ClientGoodsReceipt> => normalize(await warehouseRequest<ClientGoodsReceipt>(`v1/goods-receipts/${id}`)),
  create: async (data: GoodsReceiptFormValues): Promise<ClientGoodsReceipt> => normalize(await warehouseRequest<ClientGoodsReceipt>('v1/goods-receipts', 'POST', payload(data))),
  update: async (id: string, data: GoodsReceiptFormValues): Promise<ClientGoodsReceipt> => normalize(await warehouseRequest<ClientGoodsReceipt>(`v1/goods-receipts/${id}`, 'PATCH', payload(data))),
  confirm: async (id: string): Promise<ClientGoodsReceipt> => normalize(await warehouseRequest<ClientGoodsReceipt>(`v1/goods-receipts/${id}/confirm`, 'PATCH')),
  updateStatus: async (id: string, status: string): Promise<ClientGoodsReceipt> => {
    if (status !== 'CANCELLED') { throw new Error('Trạng thái phiếu nhập không hợp lệ'); }
    return normalize(await warehouseRequest<ClientGoodsReceipt>(`v1/goods-receipts/${id}/cancel`, 'PATCH'));
  },
  delete: async (id: string): Promise<void> => { await warehouseRequest<null>(`v1/goods-receipts/${id}`, 'DELETE'); },
};
