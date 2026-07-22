export interface Sku {
  id: string;
  skuCode: string;
  barcode: string;
  barcodeType: string;
  productId: string;
  productName: string;
  variantName: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
