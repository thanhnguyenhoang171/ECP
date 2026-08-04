import { clientFetch } from '@/lib/clientFetch';
import { Sku } from '../types/sku.interface';
import { PageResponse } from '@/types/pagination';

export const skuApi = {
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
    skuCode?: string;
    productName?: string;
    productId?: string;
    isActive?: boolean;
    active?: boolean;
  }): Promise<PageResponse<Sku>> => {
    const query = new URLSearchParams();
    
    const apiPage = params.page > 0 ? params.page - 1 : 0;
    
    query.append('page', apiPage.toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);
    
    const codeFilter = params.skuCode || params.search;
    if (codeFilter) query.append('skuCode', codeFilter);
    if (params.productName) query.append('productName', params.productName);
    if (params.productId) query.append('productId', params.productId);
    
    const activeVal = params.active !== undefined ? params.active : params.isActive;
    if (activeVal !== undefined && activeVal !== null) {
      query.append('active', activeVal.toString());
    }

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
  },

  getById: async (id: string): Promise<Sku> => {
    const res = await clientFetch(`v1/skus/${id}`);
    if (!res.ok) throw new Error('Không thể tải thông tin SKU');
    const body = await res.json();
    return body.data || body;
  },

  create: async (data: {
    skuCode: string;
    productId: string;
    productName?: string;
    variantName?: string;
    barcode?: string;
    barcodeType?: string;
    active?: boolean;
  }): Promise<Sku> => {
    const res = await clientFetch('v1/skus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Thêm mới SKU thất bại');
    const body = await res.json();
    return body.data || body;
  },

  update: async (id: string, data: Partial<{
    skuCode: string;
    variantName: string;
    barcode: string;
    barcodeType: string;
    active: boolean;
  }>): Promise<Sku> => {
    const res = await clientFetch(`v1/skus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Cập nhật SKU thất bại');
    const body = await res.json();
    return body.data || body;
  },

  delete: async (id: string): Promise<boolean> => {
    const res = await clientFetch(`v1/skus/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
};
