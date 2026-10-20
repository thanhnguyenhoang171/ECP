import type { UploadTaskContext } from '@/lib/background-task-queue';
import { ApiError } from '@/constants/errorMessages';
import { fileApi } from '@/features/files/api/file.api';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage } from '@/lib/utils';
import { PageResponse } from '@/types/pagination';
import { ProductFormValues } from '../schemas/product.schema';
import { Product, ProductDetail } from '../types/product.interface';

interface ProductImage {
  url: string;
  publicId?: string;
}

interface ProductResponse {
  success: boolean;
  data: Product;
  code?: string;
  message?: string;
}

export interface ProductListParams {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  name?: string;
  sku?: string;
  categoryId?: string;
  brandId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const toImage = async (image: unknown, task?: UploadTaskContext): Promise<ProductImage | null> => {
  if (typeof File !== 'undefined' && image instanceof File) {
    if (task) { return task.upload(image, 'products'); }
    const result = await fileApi.uploadFile(image, 'products');
    const url = result.data?.secure_url || result.data?.url;
    if (!result.success || !url) {
      throw new Error('Tải ảnh sản phẩm thất bại');
    }
    return { url, publicId: result.data?.public_id };
  }
  if (typeof image === 'string') {
    return image.trim() ? { url: image.trim() } : null;
  }
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string' && image.url.trim()) {
    return { url: image.url, publicId: 'publicId' in image && typeof image.publicId === 'string' ? image.publicId : undefined };
  }
  return null;
};

const toRecord = (items: readonly { key: string; value: string }[]): Record<string, string> =>
  Object.fromEntries(items.filter((item) => item.key.trim()).map(({ key, value }) => [key.trim(), value]));

const toPayload = async (data: ProductFormValues, clearThumbnail = false, task?: UploadTaskContext) => {
  const { descriptionImages = [], ...values } = data;
  let description = data.description || '';
  for (const item of descriptionImages) {
    if (!description.includes(item.src)) { continue; }
    const image = await toImage(item.file, task);
    if (image) {
      const escapedUrl = image.url.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
      description = description.replaceAll(item.src, escapedUrl);
    }
  }
  const images: ProductImage[] = [];
  for (const item of data.images) {
    const image = await toImage(item, task);
    if (image) { images.push(image); }
  }
  const variants = [];
  for (const variant of data.variants) {
    variants.push({ ...variant, image: await toImage(variant.image, task), attributes: toRecord(variant.attributes) });
  }
  const videos: ProductImage[] = [];
  for (const item of data.videos) {
    const video = await toImage(item, task);
    if (video) { videos.push(video); }
  }
  return {
    ...values,
    description,
    thumbnail: await toImage(data.thumbnail, task) || (clearThumbnail ? { url: '' } : null),
    images, videos, variants,
    specifications: toRecord(data.specifications),
  };
};

const readProduct = async (response: Response, fallback: string): Promise<Product> => {
  const result: ProductResponse = await response.json();
  if (!response.ok || !result.success) {
    throw new ApiError(result.code || 'PRODUCT_REQUEST_FAILED', result.message || fallback, response.status, result);
  }
  return normalizeProduct(result.data);
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  variants: product.variants?.map((variant) => ({ ...variant, isActive: variant.isActive ?? variant.active ?? true })),
  isPublished: product.isPublished ?? product.published ?? false,
  isFeatured: product.isFeatured ?? product.featured ?? false,
  isNew: product.isNew ?? product.new ?? false,
  isBestSeller: product.isBestSeller ?? product.bestSeller ?? false,
});

interface ProductImportResponse {
  success: boolean;
  message: string;
  code?: string;
  error?: string;
}

export const productApi = {
  export: async (): Promise<Blob> => {
    const res = await clientFetch('v1/products/export');
    if (!res.ok) {
      throw new Error('Không thể xuất danh sách sản phẩm');
    }
    return res.blob();
  },

  template: async (): Promise<Blob> => {
    const res = await clientFetch('v1/products/download-template');
    if (!res.ok) {
      throw new Error('Không thể tải file mẫu sản phẩm');
    }
    return res.blob();
  },

  import: async (file: File): Promise<ProductImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await clientFetch('v1/products/import', {
      method: 'POST',
      body: formData,
      skipToast: true,
    });
    const result: ProductImportResponse = await res.json();
    if (!res.ok || !result.success) {
      throw new ApiError(
        result.code || 'PRODUCT_IMPORT_FAILED',
        result.message || result.error || 'Nhập dữ liệu sản phẩm thất bại',
        res.status,
        result,
      );
    }
    return result;
  },

  create: async (data: ProductFormValues, task?: UploadTaskContext): Promise<Product> => {
    const payload = await toPayload(data, false, task);
    task?.saving();
    const response = await clientFetch('v1/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      signal: task?.signal, skipToast: Boolean(task),
    });
    return readProduct(response, 'Tạo sản phẩm thất bại');
  },

  update: async (id: string, data: ProductFormValues, task?: UploadTaskContext): Promise<Product> => {
    const payload = await toPayload(data, true, task);
    task?.saving();
    const response = await clientFetch(`v1/products/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      signal: task?.signal, skipToast: Boolean(task),
    });
    return readProduct(response, 'Cập nhật sản phẩm thất bại');
  },

  getPaged: async (params: ProductListParams): Promise<PageResponse<Product>> => {
    const query = new URLSearchParams({ page: toApiPage(params.page).toString(), size: params.size.toString() });
    for (const key of ['sort', 'search', 'name', 'sku', 'categoryId', 'brandId', 'isPublished', 'isFeatured', 'isNew', 'isBestSeller'] as const) {
      const value = params[key];
      if (value !== undefined && value !== '') {
        query.set(key, String(value));
      }
    }
    const response = await clientFetch(`v1/products?${query}`);
    if (!response.ok) {
      throw new ApiError(response.status === 403 ? 'AUTH_ACCESS_DENIED' : 'PRODUCT_LIST_FAILED', 'Không thể tải danh sách sản phẩm', response.status);
    }
    const result: PageResponse<Product> = await response.json();
    return { ...result, data: result.data.map(normalizeProduct) };
  },

  getById: async (id: string): Promise<Product> => readProduct(await clientFetch(`v1/products/${id}`), 'Không thể tải sản phẩm'),

  getDetail: async (id: string): Promise<ProductDetail> => {
    const response = await clientFetch(`v1/products/${id}/detail`);
    const result: { success: boolean; data: ProductDetail; code?: string; message?: string } = await response.json();
    if (!response.ok || !result.success) {
      throw new ApiError(result.code || 'PRODUCT_DETAIL_FAILED', result.message || 'Không thể tải chi tiết sản phẩm', response.status);
    }
    return { ...result.data, product: normalizeProduct(result.data.product) };
  },

  delete: async (id: string): Promise<void> => {
    const response = await clientFetch(`v1/products/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const result: { code?: string; message?: string } = await response.json();
      throw new ApiError(result.code || 'PRODUCT_DELETE_FAILED', result.message || 'Xóa sản phẩm thất bại', response.status);
    }
  },

};
