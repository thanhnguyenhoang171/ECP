export interface ClientWarehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  managerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientSupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
}

export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type ReceiptStatus = 'DRAFT' | 'RECEIVED' | 'CANCELLED';

export interface ClientPurchaseOrderItem {
  id?: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  productName: string;
  variantName?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  note?: string;
}

export interface ClientPurchaseOrder {
  id: string;
  code: string;
  poCode: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  expectedDeliveryDate?: string;
  note?: string;
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  createdBy: string;
  items: ClientPurchaseOrderItem[];
}

export interface ClientGoodsReceiptItem {
  id?: string;
  skuId: string;
  skuName: string;
  skuCode: string;
  productName?: string;
  quantity: number;
  unitCost: number;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
}

export interface ClientGoodsReceipt {
  id: string;
  receiptCode: string;
  warehouseId: string;
  warehouseName: string;
  purchaseOrderId?: string | null;
  purchaseOrderCode?: string | null;
  totalItems: number;
  status: ReceiptStatus;
  createdAt: string;
  createdBy: string;
  receivedAt?: string;
  note?: string;
  items: ClientGoodsReceiptItem[];
}
