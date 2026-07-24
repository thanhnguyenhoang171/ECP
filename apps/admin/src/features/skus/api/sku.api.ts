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
          first: true
        }
      };
    }
    
    const body = await res.json();

    // Unwrap 2-level response structure if backend returns wrapper object
    const inner = body?.data?.data ? body.data : body;
    const items = Array.isArray(inner?.data) 
      ? inner.data 
      : Array.isArray(body?.data) 
        ? body.data 
        : Array.isArray(body) 
          ? body 
          : [];

    const pagination = inner?.pagination || body?.pagination || {
      currentPage: params.page,
      totalPages: 1,
      totalElements: items.length,
      pageSize: params.size,
      first: true,
      last: true
    };

    return {
      success: body?.success ?? true,
      message: body?.message || inner?.message,
      data: items,
      pagination
    };
  }
};
