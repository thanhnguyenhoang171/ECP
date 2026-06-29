import { clientFetch } from '@/lib/clientFetch';
import { ApiResponse, ApiPageResponse, BaseQueryParams } from '@/types/api.interface';
import { Brand, BrandStats } from '../types/brand.interface';

export const brandApi = {
  /**
   * Lấy danh sách thương hiệu phân trang
   */
  getBrands: async (params: BaseQueryParams): Promise<ApiPageResponse<Brand>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.sort) searchParams.append('sort', params.sort);
    if (params.keyword) searchParams.append('keyword', params.keyword);

    const res = await clientFetch(`brands?${searchParams.toString()}`);
    return res.json();
  },

  /**
   * Lấy chi tiết thương hiệu
   */
  getBrandById: async (id: string): Promise<ApiResponse<Brand>> => {
    const res = await clientFetch(`brands/${id}`);
    return res.json();
  },

  /**
   * Tạo mới thương hiệu
   */
  createBrand: async (data: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    const res = await clientFetch('brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Cập nhật thương hiệu
   */
  updateBrand: async (id: string, data: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    const res = await clientFetch(`brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  /**
   * Xóa thương hiệu
   */
  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    const res = await clientFetch(`brands/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  /**
   * Lấy thống kê thương hiệu
   */
  getStats: async (): Promise<ApiResponse<BrandStats>> => {
    const res = await clientFetch('brands/stats');
    return res.json();
  }
};
