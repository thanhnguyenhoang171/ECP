import { serverFetch } from './server-fetch';
import { axiosClient, uploadFileClient } from '@/lib/axios-client';
import { Product } from '@/types/product';

/**
 * PRODUCT SERVICE
 * 🟢 Server Methods: Dùng serverFetch cho Server Components / API Routes (Caching, ISR, revalidate)
 * 🔵 Client Methods: Dùng axiosClient / uploadFileClient cho Client Components (Interactive, Upload, Form)
 */

// ==================== 🟢 SERVER METHODS (Native fetch) ====================

/**
 * Lấy danh sách sản phẩm ở Server Component với caching 60s
 */
export async function getProductsServer(category?: string) {
  const query = category ? `?category=${category}` : '';
  return serverFetch<Product[]>(`/products${query}`, {
    revalidate: 60,
    tags: ['products'],
  });
}

/**
 * Lấy chi tiết sản phẩm theo Slug ở Server Component
 */
export async function getProductBySlugServer(slug: string) {
  return serverFetch<Product>(`/products/${slug}`, {
    revalidate: 300, // Cache 5 phút
    tags: [`product-${slug}`],
  });
}

// ==================== 🔵 CLIENT METHODS (Axios Client) ====================

/**
 * Tạo sản phẩm mới (dùng Axios Client từ Form Submit)
 */
export async function createProductClient(productData: Partial<Product>) {
  return axiosClient.post<any, Product>('/products', productData);
}

/**
 * Upload hình ảnh sản phẩm mới (dùng Axios với Upload Progress)
 */
export async function uploadProductImageClient(
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('image', file);

  return uploadFileClient<{ url: string }>('/products/upload', formData, onProgress);
}
