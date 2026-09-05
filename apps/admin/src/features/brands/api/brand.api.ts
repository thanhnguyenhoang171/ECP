import { Brand } from '../types/brand.interface';
import { BrandFormValues } from '../schemas/brand.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';
import { ApiError } from '@/constants/errorMessages';

export const brandApi = {
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

  // Get active brands without pagination
  getActive: async (): Promise<Brand[]> => {
    const res = await clientFetch('v1/brands/active', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch active brands');
    const result = await res.json();
    return result.success ? result.data : [];
  },

  // Get brand by ID
  getById: async (id: string): Promise<Brand> => {
    const res = await clientFetch(`v1/brands/${id}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to fetch brand details');
    return result.data;
  },

  // Create brand
  create: async (values: BrandFormValues): Promise<{ success: boolean; data: Brand }> => {
    let logoFile: File | undefined = undefined;
    let logoUrl: string | undefined = undefined;
    if (values.logo instanceof File) {
      logoFile = values.logo;
    } else if (typeof values.logo === 'string') {
      logoUrl = values.logo;
    }

    const payload = {
      ...values,
      logo: logoUrl,
    };

    let res: Response;
    if (logoFile) {
      const formData = new FormData();
      formData.append('brand', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      formData.append('logoFile', logoFile);

      res = await clientFetch('v1/brands', {
        method: 'POST',
        body: formData,
      });
    } else {
      res = await clientFetch('v1/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    const result = await res.json();
    if (!res.ok) throw new ApiError(result.code, result.message || 'Tạo thương hiệu thất bại', res.status, result);
    return result;
  },

  // Update brand
  update: async (id: string, values: Partial<BrandFormValues>): Promise<{ success: boolean; data: Brand }> => {
    let logoFile: File | undefined = undefined;
    let logoUrl: string | undefined = undefined;
    if (values.logo instanceof File) {
      logoFile = values.logo;
    } else if (typeof values.logo === 'string') {
      logoUrl = values.logo;
    }

    const payload = {
      ...values,
      logo: logoUrl,
    };

    let res: Response;
    if (logoFile) {
      const formData = new FormData();
      formData.append('brand', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      formData.append('logoFile', logoFile);

      res = await clientFetch(`v1/brands/${id}`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      res = await clientFetch(`v1/brands/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    const result = await res.json();
    if (!res.ok) throw new ApiError(result.code, result.message || 'Cập nhật thương hiệu thất bại', res.status, result);
    return result;
  },
  // Delete brand
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const result = await res.json();
      throw new ApiError(result.code, result.message || 'Xóa thương hiệu thất bại', res.status, result);
    }
    return { success: true };
  },
};
