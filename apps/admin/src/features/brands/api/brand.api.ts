import { Brand } from '../types/brand.interface';
import { BrandFormValues } from '../schemas/brand.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';
import { ApiError } from '@/constants/errorMessages';
import { fileApi } from '@/features/files/api/file.api';

interface BrandImportResponse {
  success: boolean;
  message: string;
  code?: string;
  error?: string;
}

export const brandApi = {
  export: async (): Promise<Blob> => {
    const res = await clientFetch('v1/brands/export');
    if (!res.ok) {
      throw new Error('Không thể xuất danh sách thương hiệu');
    }
    return res.blob();
  },

  template: async (): Promise<Blob> => {
    const res = await clientFetch('v1/brands/download-template');
    if (!res.ok) {
      throw new Error('Không thể tải file mẫu thương hiệu');
    }
    return res.blob();
  },

  import: async (file: File): Promise<BrandImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await clientFetch('v1/brands/import', {
      method: 'POST',
      body: formData,
      skipToast: true,
    });
    const result: BrandImportResponse = await res.json();
    if (!res.ok || !result.success) {
      throw new ApiError(
        result.code || 'BRAND_IMPORT_FAILED',
        result.message || result.error || 'Nhập dữ liệu thương hiệu thất bại',
        res.status,
        result,
      );
    }
    return result;
  },

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
    let logoUrl: string | undefined = undefined;

    if (values.logo instanceof File) {
      const uploadRes = await fileApi.uploadFile(values.logo, 'brands');
      logoUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
    } else if (typeof values.logo === 'string') {
      logoUrl = values.logo;
    }

    const payload = {
      ...values,
      logo: logoUrl,
    };

    const res = await clientFetch('v1/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) throw new ApiError(result.code, result.message || 'Tạo thương hiệu thất bại', res.status, result);
    return result;
  },

  // Update brand
  update: async (id: string, values: Partial<BrandFormValues>): Promise<{ success: boolean; data: Brand }> => {
    let logoUrl: string | undefined = undefined;

    if (values.logo instanceof File) {
      const uploadRes = await fileApi.uploadFile(values.logo, 'brands');
      logoUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
    } else if (typeof values.logo === 'string') {
      logoUrl = values.logo;
    }

    const payload = {
      ...values,
      logo: logoUrl,
    };

    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
