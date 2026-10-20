import { Brand } from '../types/brand.interface';
import { BrandFormValues } from '../schemas/brand.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';
import { ApiError } from '@/constants/errorMessages';
import { readCatalogResult, resolveCatalogImage, downloadCatalogFile, importCatalogFile, type CatalogResult } from '@/lib/catalog-api';

export const brandApi = {
  export: (): Promise<Blob> => downloadCatalogFile('v1/brands/export'),
  template: (): Promise<Blob> => downloadCatalogFile('v1/brands/download-template'),
  import: (file: File): Promise<CatalogResult<null>> => importCatalogFile('v1/brands/import', file),
  // Get paged brand list
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    active?: boolean;
  }): Promise<PageResponse<Brand>> => {
    const query = new URLSearchParams();

    query.append('page', toApiPage(params.page).toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);
    if (params.name) query.append('name', params.name);
    if (params.active !== undefined) query.append('active', params.active.toString());

    const res = await clientFetch(`v1/brands?${query.toString()}`);
    if (!res.ok) {
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem thương hiệu', 403);
      }
      throw new Error('Failed to fetch brands');
    }
    const result: PageResponse<Brand> = await res.json();
    return syncPagination<PageResponse<Brand>>(result);
  },

  getActive: async (params: { page?: number; size?: number; name?: string } = {}): Promise<PageResponse<Brand>> => {
    const query = new URLSearchParams({
      page: toApiPage(params.page ?? 1).toString(),
      size: (params.size ?? 10).toString(),
    });
    if (params.name?.trim()) {
      query.set('name', params.name.trim());
    }
    const res = await clientFetch(`v1/brands/active?${query}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new ApiError(res.status === 403 ? 'AUTH_ACCESS_DENIED' : 'BRAND_LIST_FAILED', 'Không thể tải thương hiệu', res.status);
    }
    const result: PageResponse<Brand> = await res.json();
    return syncPagination<PageResponse<Brand>>(result);
  },

  // Get brand by ID
  getById: async (id: string): Promise<Brand> => {
    const res = await clientFetch(`v1/brands/${id}`);
    return (await readCatalogResult<Brand>(res, 'Không thể tải thương hiệu')).data;
  },

  // Create brand
  create: async (values: BrandFormValues): Promise<{ success: boolean; data: Brand }> => {
    const payload = {
      ...values,
      logo: values.logo === undefined ? undefined : (await resolveCatalogImage(values.logo, 'brands')).url,
    };

    const res = await clientFetch('v1/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return readCatalogResult<Brand>(res, 'Tạo thương hiệu thất bại');
  },

  // Update brand
  update: async (id: string, values: Partial<BrandFormValues>): Promise<{ success: boolean; data: Brand }> => {
    const payload = {
      ...values,
      logo: values.logo === undefined ? undefined : (await resolveCatalogImage(values.logo, 'brands')).url,
    };

    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return readCatalogResult<Brand>(res, 'Cập nhật thương hiệu thất bại');
  },
  // Delete brand
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'DELETE',
    });
    await readCatalogResult<null>(res, 'Xóa thương hiệu thất bại');
    return { success: true };
  },
};
