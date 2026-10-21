import type { Sku } from '@/features/skus/types/sku.interface';

export interface BarcodeStock {
  id: string;
  warehouseId: string;
  warehouseName: string;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
  quantityOnHand: number;
  quantityLocked: number;
}

export interface BarcodeLookup {
  sku: Sku;
  costPrice: number;
  price: number;
  quantityOnHand: number;
  quantityLocked: number;
  quantityAvailable: number;
  stocks: BarcodeStock[];
}
