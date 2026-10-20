export interface ProductVideo {
  url: string;
  publicId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  videos?: ProductVideo[];
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  viewCount?: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  inStock: boolean;
  tags?: string[];
  categoryId?: string;
  brand?: string;
  variants?: ProductVariant[];
  specifications?: Record<string, string | number | boolean>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: any;
  image?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  itemCount: number;
}

export interface ProductVariant {
  skuId?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  barcode?: string;
  image?: string;
  attributes: Record<string, string | number | boolean>;
}

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string | { url?: string } | null;
  images?: Array<string | { url?: string }>;
  videos?: ProductVideo[];
  categoryId?: string;
  categoryName?: string;
  category?: { id?: string; name?: string } | string;
  brand?: { name?: string } | string;
  variants?: Array<Omit<ProductVariant, 'image'> & {
    image?: string | { url?: string } | null;
    isActive?: boolean;
    active?: boolean;
  }>;
  specifications?: Record<string, string | number | boolean>;
  isPublished?: boolean;
  published?: boolean;
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  viewCount?: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

export interface CatalogPage<T> {
  success: boolean;
  data: T[];
  pagination: { currentPage: number; totalPages: number; last: boolean };
}
