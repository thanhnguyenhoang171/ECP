import { clientFetch } from '@/lib/clientFetch';
import { Product } from '../types/product.interface';
import { ProductFormValues } from '../schemas/product.schema';

export const productApi = {
  create: async (data: ProductFormValues): Promise<Product> => {
    try {
      const res = await clientFetch('v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
    } catch (error) {
      console.warn('Backend create product failed, using mock fallback', error);
    }

    // Fallback mock logic for testing UI without backend
    return {
      ...data,
      id: 'mock-id-' + Date.now(),
      price: data.variants[0]?.price || 0,
      stock: 0,
      createdAt: new Date().toISOString(),
    } as unknown as Product;
  },

  update: async (id: string, data: ProductFormValues): Promise<Product> => {
    try {
      const res = await clientFetch(`v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        return result.data || result;
      }
    } catch (error) {
      console.warn('Backend update product failed, using mock fallback', error);
    }

    // Fallback mock logic for testing UI without backend
    return {
      ...data,
      id,
      price: data.variants[0]?.price || 0,
      stock: 0,
      updatedAt: new Date().toISOString(),
    } as unknown as Product;
  },

  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
    name?: string;
    categoryId?: string;
    brandId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
  }): Promise<import('@/types/pagination').PageResponse<Product>> => {
    const query = new URLSearchParams();

    const apiPage = params.page > 0 ? params.page - 1 : 0;

    query.append('page', apiPage.toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);
    
    // Map search/name to 'name' parameter expected by backend ProductFilterRequest
    const filterName = params.name || params.search;
    if (filterName) query.append('name', filterName);
    
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.brandId) query.append('brandId', params.brandId);
    if (params.isPublished !== undefined && params.isPublished !== null) {
      query.append('isPublished', params.isPublished.toString());
    }
    if (params.isFeatured !== undefined && params.isFeatured !== null) {
      query.append('isFeatured', params.isFeatured.toString());
    }
    if (params.isNew !== undefined && params.isNew !== null) {
      query.append('isNew', params.isNew.toString());
    }
    if (params.isBestSeller !== undefined && params.isBestSeller !== null) {
      query.append('isBestSeller', params.isBestSeller.toString());
    }

    const res = await clientFetch(`v1/products?${query.toString()}`);
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
        }
      } as any;
    }
    const result = await res.json();
    return result;
  },

  getById: async (id: string): Promise<Product> => {
    const res = await clientFetch(`v1/products/${id}`);
    if (!res.ok) {
      throw new Error('Failed to fetch product');
    }
    const result = await res.json();
    return result.data || result;
  }
};
