export interface Sku {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
