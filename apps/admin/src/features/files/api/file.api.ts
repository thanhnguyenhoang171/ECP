import { clientFetch } from '@/lib/clientFetch';
import { ApiResponse } from '@/types/api.interface';
import { ApiError } from '@/constants/errorMessages';

export interface CloudinaryFile {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
  original_filename?: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

export const fileApi = {
  /**
   * Fetch upload signature for direct Cloudinary upload from browser
   */
  getSignature: async (folder?: string): Promise<ApiResponse<UploadSignatureResponse>> => {
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await clientFetch(`v1/files/signature${query}`);
    if (!res.ok) {
      throw new Error('Failed to generate upload signature');
    }
    return res.json();
  },

  /**
   * Upload file directly to Cloudinary using signed signature (bypasses application server)
   */
  uploadWithSignature: async (file: File, folder: string = 'banners'): Promise<CloudinaryFile> => {
    const sigRes = await fileApi.getSignature(folder);
    if (!sigRes.success || !sigRes.data) {
      throw new Error('Failed to get Cloudinary signature');
    }

    const { signature, timestamp, apiKey, cloudName, folder: serverFolder } = sigRes.data;
    const targetFolder = serverFolder || folder;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    if (targetFolder) {
      formData.append('folder', targetFolder);
    }

    const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(cloudUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error?.message || 'Direct Cloudinary upload failed');
    }

    const result = await response.json();
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url || result.secure_url,
      format: result.format,
      bytes: result.bytes,
    };
  },

  /**
   * Upload single file to Cloudinary
   * @param file File object to upload
   * @param folder Folder name on Cloudinary (optional)
   */
  uploadFile: async (file: File, folder?: string): Promise<ApiResponse<CloudinaryFile>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const res = await clientFetch('v1/files/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Tải lên tập tin thất bại', res.status, errJson);
    }
    
    return res.json();
  },

  /**
   * Upload multiple files to Cloudinary
   * @param files Array of File objects to upload
   * @param folder Folder name on Cloudinary (optional)
   */
  uploadMultipleFiles: async (files: File[], folder?: string): Promise<ApiResponse<CloudinaryFile[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const res = await clientFetch('v1/files/upload-multiple', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Tải lên danh sách tập tin thất bại', res.status, errJson);
    }

    return res.json();
  },

  /**
   * Delete a file from Cloudinary using public_id
   * @param publicId Cloudinary public_id of the file to delete
   */
  deleteFile: async (publicId: string): Promise<ApiResponse<void>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('public_id', publicId);

    const res = await clientFetch(`v1/files/delete?${searchParams.toString()}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Xóa tập tin thất bại', res.status, errJson);
    }

    return res.json();
  },
};
