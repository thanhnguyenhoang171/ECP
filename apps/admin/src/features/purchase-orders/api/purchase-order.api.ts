import { warehouseList, warehouseRequest } from '@/features/inventory/api/warehouse-request';
import type { ClientPurchaseOrder, ClientPurchaseOrderItem } from '@/features/inventory/types/inventory.types';
import type { PurchaseOrderFormValues } from '../schemas/purchase-order.schema';

type ApiPurchaseOrder = Omit<ClientPurchaseOrder, 'items'> & {
  items: (ClientPurchaseOrderItem & { orderQuantity: number })[];
};

const normalize = (order: ApiPurchaseOrder): ClientPurchaseOrder => {
  const items = order.items.map((item) => ({ ...item, orderedQuantity: item.orderQuantity,
    skuName: [item.productName, item.variantName].filter(Boolean).join(' · ') || item.skuCode }));
  return { ...order, code: order.poCode, items, totalItems: items.length,
    totalQuantity: items.reduce((total, item) => total + item.orderedQuantity, 0),
    totalAmount: items.reduce((total, item) => total + item.orderedQuantity * item.unitPrice, 0) };
};

const payload = (data: PurchaseOrderFormValues): unknown => ({
  poCode: data.code || `PO-${crypto.randomUUID()}`,
  supplierId: data.supplierId, warehouseId: data.warehouseId,
  expectedDeliveryDate: data.expectedDeliveryDate ? `${data.expectedDeliveryDate.slice(0, 10)}T00:00:00` : null,
  note: data.note || '',
  items: data.items.map((item) => ({ skuId: item.skuId, orderQuantity: item.orderedQuantity, unitPrice: item.unitPrice })),
});

export const purchaseOrderApi = {
  getAll: async (): Promise<ClientPurchaseOrder[]> => (await warehouseList<ApiPurchaseOrder>('v1/purchase-orders')).map(normalize),
  getById: async (id: string): Promise<ClientPurchaseOrder> => normalize(await warehouseRequest<ApiPurchaseOrder>(`v1/purchase-orders/${id}`)),
  create: async (data: PurchaseOrderFormValues): Promise<ClientPurchaseOrder> => normalize(await warehouseRequest<ApiPurchaseOrder>('v1/purchase-orders', 'POST', payload(data))),
  update: async (id: string, data: PurchaseOrderFormValues): Promise<ClientPurchaseOrder> => normalize(await warehouseRequest<ApiPurchaseOrder>(`v1/purchase-orders/${id}`, 'PATCH', payload(data))),
  updateStatus: async (id: string, status: string): Promise<ClientPurchaseOrder> => normalize(await warehouseRequest<ApiPurchaseOrder>(`v1/purchase-orders/${id}/status`, 'PATCH', { status })),
  delete: async (id: string): Promise<void> => { await warehouseRequest<null>(`v1/purchase-orders/${id}`, 'DELETE'); },
};
