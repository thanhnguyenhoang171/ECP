export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: string | null;
  level: number;
  description: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
