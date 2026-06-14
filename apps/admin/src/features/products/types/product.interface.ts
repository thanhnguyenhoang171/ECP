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
  thumbnail?: string;
  images?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  compareAtPrice?: number;
  costPrice?: number;
  barcode?: string;
  barcodeType?: string;
  image?: string;
  isActive?: boolean;
}

