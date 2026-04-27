import { Category } from '../types/category.interface';
import { CategoryFormValues } from '../schemas/category.schema';
import { PageResponse } from '@/types/pagination';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`;

export const categoryApi = {
  // Lấy danh sách danh mục có phân trang và lọc
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    parentId?: string;
    level?: number;
    active?: boolean;
  }): Promise<PageResponse<Category>> => {
    const query = new URLSearchParams();

    // Pageable params
    query.append('page', params.page.toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);

    // Filter params
    if (params.name) query.append('name', params.name);
    if (params.parentId) query.append('parentId', params.parentId);
    if (params.level !== undefined)
      query.append('level', params.level.toString());
    if (params.active !== undefined)
      query.append('active', params.active.toString());

    const res = await fetch(`${BASE_URL}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Cập nhật danh mục
  update: async (id: string, values: Partial<CategoryFormValues>): Promise<{ success: boolean; data: Category }> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update category');
    return result;
  },

  // Tạo mới danh mục
  create: async (values: CategoryFormValues): Promise<{ success: boolean; data: Category }> => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create category');
    return result;
  },

  // Xóa danh mục
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to delete category');
    }
    return { success: true };
  },

  // Lấy danh sách danh mục cha
  getParents: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE_URL}/parents`, {
      cache: 'no-store', // Đảm bảo không lấy cache trình duyệt
    });
    if (!res.ok) throw new Error('Failed to fetch parent categories');
    const result = await res.json();
    return result.success ? result.data : [];
  },
};
