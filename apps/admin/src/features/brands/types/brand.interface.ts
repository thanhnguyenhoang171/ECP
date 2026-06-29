export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandStats {
  totalBrands: number;
  activeBrands: number;
  newBrandsThisMonth: number;
}
