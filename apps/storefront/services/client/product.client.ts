import { axiosClient, uploadFileClient } from '@/lib/axios-client';
import { Product } from '@/types/product';

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
