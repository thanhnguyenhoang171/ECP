// Aligned with Spring Boot ProductResponse.java
export interface ProductVariant {
  // From ProductResponse.ProductVariantResponse
  sku: string;
  skuId?: string;
  barcode?: string;
  barcodeType?: string;
  price: number;        // BigDecimal → number
  costPrice?: number;   // BigDecimal → number
  compareAtPrice?: number; // BigDecimal → number
  image?: { url?: string; publicId?: string } | string | null;
  attributes: Record<string, any>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy compat
  stock?: number;
  id?: string;
}

export interface Product {
  // From ProductResponse.java - exact fields only
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand?: string;
  brandId?: string;
  categoryId: string;
  description?: string;
  thumbnail?: { url?: string; publicId?: string } | string | null;
  images?: Array<{ url?: string; publicId?: string } | string>;
  specifications?: Record<string, any> | Array<{ key: string; value: any }>;
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

  // Computed/compat properties — NOT in backend DTO, derived on FE:
  // price → use variants[0]?.price
  // stock → use inventoryApi separately
  // categoryName → lookup from categories list
  // supplierId / weight / length / width / height → not in ProductResponse
}
