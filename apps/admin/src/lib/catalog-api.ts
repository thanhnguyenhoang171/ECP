import { ApiError } from '@/constants/errorMessages';
import { clientFetch } from '@/lib/clientFetch';
import { fileApi } from '@/features/files/api/file.api';

export interface CatalogResult<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

export const readCatalogResult = async <T>(response: Response, fallback: string): Promise<CatalogResult<T>> => {
  const result: CatalogResult<T> = await response.json();
  if (!response.ok || !result.success) {
    throw new ApiError(result.code || 'CATALOG_REQUEST_FAILED', result.message || result.error || fallback, response.status, result);
  }
  return result;
};

export interface CatalogImage {
  url: string;
  publicId?: string;
}

export const resolveCatalogImage = async (image: unknown, folder: string): Promise<CatalogImage> => {
  if (typeof File !== 'undefined' && image instanceof File) {
    const result = await fileApi.uploadFile(image, folder);
    const url = result.data?.secure_url || result.data?.url;
    if (!result.success || !url) {
      throw new Error('Tải ảnh thất bại');
    }
    return { url, publicId: result.data?.public_id };
  }
  if (typeof image === 'string') {
    return { url: image };
  }
  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    return { url: image.url, publicId: 'publicId' in image && typeof image.publicId === 'string' ? image.publicId : undefined };
  }
  return { url: '' };
};

export const downloadCatalogFile = async (path: string): Promise<Blob> => {
  const response = await clientFetch(path);
  if (!response.ok) {
    throw new Error('Không thể tải file Excel');
  }
  return response.blob();
};

export const importCatalogFile = async (path: string, file: File): Promise<CatalogResult<null>> => {
  const body = new FormData();
  body.append('file', file);
  return readCatalogResult<null>(await clientFetch(path, { method: 'POST', body, skipToast: true }), 'Nhập dữ liệu thất bại');
};
