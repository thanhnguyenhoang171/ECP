export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
