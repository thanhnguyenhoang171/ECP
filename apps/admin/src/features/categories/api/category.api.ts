import { Category } from '../types/category.interface';
import { CategoryFormValues } from '../schemas/category.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';

// Helper to map category response to frontend model
const mapCategory = (cat: any): Category => {
  if (!cat) return cat;

  // Extract parent ID safely
  let parentId = null;
  if (cat.parentId) {
    parentId = typeof cat.parentId === 'object' ? cat.parentId.id?.toString() : cat.parentId.toString();
  } else if (cat.parent) {
    parentId = cat.parent.id?.toString();
  }

  return {
    ...cat,
    id: cat.id?.toString(),
    parentId: parentId || null,
    imageUrl: cat.imageUrl || cat.imageUrl,
  };
};

export const categoryApi = {
  // Lấy danh sách danh mục có phân trang và lọc
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    id?: string;
    parentId?: string;
    level?: number;
    active?: boolean;
  }): Promise<PageResponse<Category>> => {
    const query = new URLSearchParams();

    // Pageable params
    query.append('page', toApiPage(params.page).toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);

    // Filter params
    if (params.name) query.append('name', params.name);
    if (params.id) query.append('id', params.id);
    if (params.parentId) query.append('parentId', params.parentId);
    if (params.level !== undefined)
      query.append('level', params.level.toString());
    if (params.active !== undefined)
      query.append('active', params.active.toString());

    const res = await clientFetch(`v1/categories?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const result: PageResponse<Category> = await res.json();
    
    if (result.data) {
      result.data = result.data.map(mapCategory);
    }
    
    return syncPagination<PageResponse<Category>>(result);
  },

  // Cập nhật danh mục
  update: async (
    id: string,
    values: Partial<CategoryFormValues>,
  ): Promise<{ success: boolean; data: Category }> => {
    const { imageUrl, imagePublicId, ...rest } = values;
    const payload = {
      ...rest,
      imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      imagePublicId: imagePublicId || undefined,
    };

    const res = await clientFetch(`v1/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update category');
    if (result.data) {
      result.data = mapCategory(result.data);
    }
    return result;
  },

  // Tạo mới danh mục
  create: async (
    values: CategoryFormValues,
  ): Promise<{ success: boolean; data: Category }> => {
    const { imageUrl, imagePublicId, ...rest } = values;
    const payload = {
      ...rest,
      imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
      imagePublicId: imagePublicId || undefined,
    };

    const res = await clientFetch('v1/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create category');
    if (result.data) {
      result.data = mapCategory(result.data);
    }
    return result;
  },

  // Xóa danh mục
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to delete category');
    }
    return { success: true };
  },

  // Lấy chi tiết danh mục theo ID
  getById: async (id: string): Promise<Category> => {
    const res = await clientFetch(`v1/categories/${id}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch category details");
    return mapCategory(result.data);
  },

  // Lấy danh sách danh mục cha
  getParents: async (): Promise<Category[]> => {
    const res = await clientFetch('v1/categories/parents', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch parent categories');
    const result = await res.json();
    return result.success ? result.data.map(mapCategory) : [];
  },

  // Export file excel
  export: async (): Promise<Blob> => {
    const res = await clientFetch('v1/categories/export', {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to export categories');
    return res.blob();
  },
  
  // Fetch template file
  template: async (): Promise<Blob> => {
    const res = await clientFetch('v1/categories/template', {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch template');
    return res.blob();
  },

  // Import categories from Excel file
  import: async (file: File): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await clientFetch('v1/categories/import', {
      method: 'POST',
      body: formData,
      skipToast: true,
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },
};
