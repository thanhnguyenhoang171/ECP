export type ProductStatus = 'active' | 'out_of_stock' | 'disabled';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  status: ProductStatus;
  category?: string;
  description?: string;
  image?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}
