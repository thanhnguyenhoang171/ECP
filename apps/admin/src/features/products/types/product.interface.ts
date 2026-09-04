export type AttributeValue = string | number | boolean;

export interface ProductVariant {
  sku: string;
  skuId?: string;
  barcode?: string;
  barcodeType?: string;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  image?: { url?: string; publicId?: string } | string | null;
  attributes: Record<string, AttributeValue>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
  id?: string;
  variantName?: string;
}

export interface ProductSpecificationItem {
  key: string;
  value: AttributeValue;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface BrandInfo {
  id?: string;
  name?: string;
}

export interface CategoryInfo {
  id?: string;
  name?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand?: BrandInfo | string;
  brandId?: string;
  category?: CategoryInfo | string;
  categoryId?: string;
  categoryName?: string;
  supplierId?: string;
  description?: string;
  thumbnail?: { url?: string; publicId?: string } | string | null;
  images?: Array<{ url?: string; publicId?: string } | string>;
  specifications?: Record<string, AttributeValue> | ProductSpecificationItem[];
  variants?: ProductVariant[];
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

  price?: number;
  costPrice?: number;
  compareAtPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  published?: boolean;
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  stock?: number;
}

