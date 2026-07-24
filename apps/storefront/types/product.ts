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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  itemCount: number;
}
