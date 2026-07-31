import { Brand } from '../types/brand.interface';
import { BrandFormValues } from '../schemas/brand.schema';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';

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
    if (!res.ok) throw new Error('Failed to fetch brands');
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
    const res = await clientFetch('v1/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create brand');
    return result;
  },

  // Update brand
  update: async (id: string, values: Partial<BrandFormValues>): Promise<{ success: boolean; data: Brand }> => {
    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update brand');
    return result;
  },
  // Delete brand
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/brands/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to delete brand');
    }
    return { success: true };
  },
};
