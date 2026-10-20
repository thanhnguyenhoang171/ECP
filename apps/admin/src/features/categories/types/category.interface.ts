export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  order?: number;
  sortOrder?: number;
  isFeatured?: boolean;
  image?: { url?: string; publicId?: string } | string | null;
  imageUrl?: string | null;
  imagePublicId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}


