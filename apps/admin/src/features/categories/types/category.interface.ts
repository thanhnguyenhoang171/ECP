export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: string | null;
  level: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  order?: number;
  imageUrl?: any;
  imagePublicId?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}


