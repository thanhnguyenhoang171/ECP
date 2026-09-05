import { clientFetch } from '@/lib/clientFetch';
import { ApiError } from '@/constants/errorMessages';
import { Product } from '../types/product.interface';
import { ProductFormValues } from '../schemas/product.schema';

export const productApi = {
  create: async (data: ProductFormValues): Promise<Product> => {
    try {
      const formData = new FormData();
      let hasFiles = false;

      // Process Thumbnail
      let thumbnailFile: File | undefined = undefined;
      let thumbnailObj: any = undefined;
      if (data.thumbnail instanceof File) {
        thumbnailFile = data.thumbnail;
        hasFiles = true;
      } else if (typeof data.thumbnail === 'string' && data.thumbnail.trim() !== '') {
        thumbnailObj = { url: data.thumbnail };
      } else if (data.thumbnail && typeof data.thumbnail === 'object' && data.thumbnail.url) {
        thumbnailObj = data.thumbnail;
      }

      // Process Gallery Images
      const imageFiles: File[] = [];
      const imageObjs: any[] = [];
      if (Array.isArray(data.images)) {
        data.images.forEach(img => {
          if (img instanceof File) {
            imageFiles.push(img);
            hasFiles = true;
          } else if (typeof img === 'string' && img.trim() !== '') {
            imageObjs.push({ url: img });
          } else if (img && typeof img === 'object' && img.url) {
            imageObjs.push(img);
          }
        });
      }

      // Build JSON Payload
      const payload: any = {
        ...data,
        thumbnail: thumbnailObj,
        images: imageObjs,
        specifications: Array.isArray(data.specifications) ? data.specifications.reduce((acc: any, curr: any) => {
          if (curr.key) acc[curr.key] = curr.value;
          return acc;
        }, {}) : (data.specifications || {}),
        variants: (data.variants || []).map(v => ({
          ...v,
          attributes: Array.isArray(v.attributes) ? v.attributes.reduce((acc: any, curr: any) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
          }, {}) : (v.attributes || {})
        }))
      };

      let res: Response;
      if (hasFiles) {
        formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (thumbnailFile) {
          formData.append('thumbnailFile', thumbnailFile);
        }
        imageFiles.forEach(f => {
          formData.append('imageFiles', f);
        });

        res = await clientFetch('v1/products', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await clientFetch('v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const result = await res.json();
        return (result.data || result) as Product;
      }
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(errorData.code, errorData.message || 'Tạo sản phẩm thất bại', res.status, errorData);
    } catch (error) {
      if (error instanceof ApiError || (error as Error)?.name !== 'TypeError') {
        throw error;
      }
      console.warn('Backend create product failed due to network, using mock fallback', error);
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
    // Sanitize Thumbnail
    let thumbnailObj: any = null;
    if (typeof data.thumbnail === 'string' && data.thumbnail.trim() !== '') {
      thumbnailObj = { url: data.thumbnail };
    } else if (data.thumbnail && typeof data.thumbnail === 'object' && (data.thumbnail as any).url) {
      thumbnailObj = data.thumbnail;
    }

    // Sanitize Gallery Images
    const imageObjs: any[] = [];
    if (Array.isArray(data.images)) {
      data.images.forEach(img => {
        if (typeof img === 'string' && img.trim() !== '') {
          imageObjs.push({ url: img });
        } else if (img && typeof img === 'object' && (img as any).url) {
          imageObjs.push(img);
        }
      });
    }

    const payload: any = {
      ...data,
      thumbnail: thumbnailObj,
      images: imageObjs.length > 0 ? imageObjs : undefined,
      specifications: Array.isArray(data.specifications) ? data.specifications.reduce((acc: any, curr: any) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {}) : (data.specifications || {}),
      variants: (data.variants || []).map(v => {
        let variantImage: any = null;
        if (typeof v.image === 'string' && v.image.trim() !== '') {
          variantImage = { url: v.image };
        } else if (v.image && typeof v.image === 'object' && (v.image as any).url) {
          variantImage = v.image;
        }

        return {
          ...v,
          image: variantImage,
          attributes: Array.isArray(v.attributes) ? v.attributes.reduce((acc: any, curr: any) => {
            if (curr.key) acc[curr.key] = curr.value;
            return acc;
          }, {}) : (v.attributes || {})
        };
      })
    };

    const res = await clientFetch(`v1/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(errorData.code, errorData.message || 'Cập nhật sản phẩm thất bại', res.status, errorData);
    }

    const result = await res.json();
    return result.data || result;
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
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem danh sách sản phẩm', 403);
      }
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
        },
      } as unknown as import('@/types/pagination').PageResponse<Product>;
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
  },

  getDetail: async (id: string): Promise<any> => {
    const res = await clientFetch(`v1/products/${id}/detail`);
    if (!res.ok) {
      throw new Error('Failed to fetch product composite details');
    }
    const result = await res.json();
    return result.data || result;
  },

  delete: async (id: string): Promise<void> => {
    const res = await clientFetch(`v1/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(errorData.code, errorData.message || 'Xóa sản phẩm thất bại', res.status, errorData);
    }
  }
};
