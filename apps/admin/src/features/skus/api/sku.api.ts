import { clientFetch } from '@/lib/clientFetch';
import { Sku } from '../types/sku.interface';
import { PageResponse } from '@/types/pagination';

export const skuApi = {
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
    productId?: string;
    isActive?: boolean;
  }): Promise<PageResponse<Sku>> => {
    const query = new URLSearchParams();
    
    const apiPage = params.page > 0 ? params.page - 1 : 0;
    
    query.append('page', apiPage.toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);
    if (params.search) query.append('search', params.search);
    if (params.productId) query.append('productId', params.productId);
    if (params.isActive !== undefined) query.append('isActive', params.isActive.toString());

    const res = await clientFetch(`v1/skus?${query.toString()}`);
    if (!res.ok) {
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: params.page,
          totalPages: 0,
          totalElements: 0,
          pageSize: params.size,
          last: true,
          first: true,
          empty: true
        }
      };
    }
    
    return await res.json();
  }
};
