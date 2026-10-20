import type { UploadTaskContext } from '@/lib/background-task-queue';
import { Category } from '../types/category.interface';
import { CategoryFormValues } from '../schemas/category.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';
import { ApiError } from '@/constants/errorMessages';
import { readCatalogResult, resolveCatalogImage, importCatalogFile, type CatalogResult } from '@/lib/catalog-api';

const mapCategory = (category: Category): Category => {
  const image = category.image;
  const imageUrl = category.imageUrl || (typeof image === 'string' ? image : image?.url) || null;
  return {
    ...category,
    parentId: category.parentId || null,
    imageUrl,
    imagePublicId: category.imagePublicId || (typeof image === 'object' ? image?.publicId : undefined),
  };
};

const toPayload = async (values: Partial<CategoryFormValues>, task?: UploadTaskContext) => {
  const { imageUrl, imagePublicId, ...rest } = values;
  const image = imageUrl === undefined ? undefined : await resolveCatalogImage(imageUrl, 'categories', task);
  return {
    ...rest,
    parentId: values.parentId === 'none' ? '' : values.parentId,
    image: image ? { ...image, publicId: image.publicId || imagePublicId } : undefined,
  };
};

export const categoryApi = {
  getActive: async (params: { page?: number; size?: number; name?: string } = {}): Promise<PageResponse<Category>> => {
    const query = new URLSearchParams({
      page: toApiPage(params.page ?? 1).toString(),
      size: (params.size ?? 10).toString(),
    });
    if (params.name?.trim()) {
      query.set('name', params.name.trim());
    }
    const res = await clientFetch(`v1/categories/active?${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem danh mục sản phẩm', 403);
      }
      throw new Error('Không thể tải danh sách danh mục đang hoạt động');
    }
    const result: PageResponse<Category> = await res.json();
    return syncPagination<PageResponse<Category>>({
      ...result,
      data: (result.data || []).map(mapCategory),
    });
  },

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
    isFeatured?: boolean;
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
    if (params.isFeatured !== undefined)
      query.append('isFeatured', params.isFeatured.toString());

    const res = await clientFetch(`v1/categories?${query.toString()}`);
    if (!res.ok) {
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem danh mục sản phẩm', 403);
      }
      throw new Error('Failed to fetch categories');
    }
    const result: PageResponse<Category> = await res.json();
    
    if (result.data) {
      result.data = result.data.map(mapCategory);
    }
    
    return syncPagination<PageResponse<Category>>(result);
  },

  update: async (id: string, values: Partial<CategoryFormValues>, task?: UploadTaskContext): Promise<{ success: boolean; data: Category }> => {
    const payload = await toPayload(values, task);
    task?.saving();
    const response = await clientFetch(`v1/categories/${id}`, {
      signal: task?.signal, skipToast: Boolean(task),
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const result = await readCatalogResult<Category>(response, 'Cập nhật danh mục thất bại');
    return { ...result, data: mapCategory(result.data) };
  },

  create: async (values: CategoryFormValues, task?: UploadTaskContext): Promise<{ success: boolean; data: Category }> => {
    const payload = await toPayload(values, task);
    task?.saving();
    const response = await clientFetch('v1/categories', {
      signal: task?.signal, skipToast: Boolean(task),
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const result = await readCatalogResult<Category>(response, 'Tạo danh mục thất bại');
    return { ...result, data: mapCategory(result.data) };
  },

  // Xóa danh mục
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/categories/${id}`, {
      method: 'DELETE',
    });
    await readCatalogResult<null>(res, 'Xóa danh mục thất bại');
    return { success: true };
  },

  // Lấy chi tiết danh mục theo ID
  getById: async (id: string): Promise<Category> => {
    const res = await clientFetch(`v1/categories/${id}`);
    return mapCategory((await readCatalogResult<Category>(res, 'Không thể tải danh mục')).data);
  },

  // Lấy danh sách danh mục cha
  getParents: async (): Promise<Category[]> => {
    const res = await clientFetch('v1/categories/parents', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch parent categories');
    const result = await readCatalogResult<Category[]>(res, 'Không thể tải danh mục cha');
    return result.data.map(mapCategory);
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
    const res = await clientFetch('v1/categories/download-template', {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch template');
    return res.blob();
  },

  import: (file: File): Promise<CatalogResult<null>> => importCatalogFile('v1/categories/import', file),
};
