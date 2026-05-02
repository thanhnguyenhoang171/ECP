export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  price: number;
  stock: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}
