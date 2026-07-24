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
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  viewCount?: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
  variants?: ProductVariant[];
  thumbnail?: string;
  images?: string[];
  specifications?: Record<string, any> | Array<{ key: string; value: any }>;
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

