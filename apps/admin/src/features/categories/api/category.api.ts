import { Category } from '../types/category.interface';
import { CategoryFormValues } from '../schemas/category.schema';
import { PageResponse } from '@/types/pagination';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`;

export const categoryApi = {
  // Lấy danh sách danh mục có phân trang (Dùng ở Client nếu cần)
  getPaged: async (params: { page: number; size: number; sort?: string }): Promise<PageResponse<Category>> => {
    const query = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      sort: params.sort || 'name,asc'
    });
    
    const res = await fetch(`${BASE_URL}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Lấy danh sách danh mục cha
  getParents: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/parents`);
    if (!res.ok) throw new Error('Failed to fetch parent categories');
    const result = await res.json();
    return result.success ? result.data : [];
  },

  // Tạo mới danh mục
  create: async (data: CategoryFormValues): Promise<Category> => {
    const payload = { ...data };
    if (!payload.parentId || payload.parentId === '' || payload.parentId === 'none') {
      delete payload.parentId;
    }

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to create category');
    }
    
    return res.json();
  },

  // Kiểm tra trùng lặp slug
  checkSlug: async (slug: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/check-slug?slug=${slug}`);
      if (!res.ok) return true;
      const result = await res.json();
      return result.isAvailable;
    } catch {
      return true;
    }
  },
};
