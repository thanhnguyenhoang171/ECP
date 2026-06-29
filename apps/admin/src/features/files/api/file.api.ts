import { clientFetch } from '@/lib/clientFetch';
import { ApiResponse } from '@/types/api.interface';

export interface CloudinaryFile {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
  original_filename?: string;
}

export const fileApi = {
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
      throw new Error('Failed to upload file');
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
      throw new Error('Failed to upload files');
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
      throw new Error('Failed to delete file');
    }

    return res.json();
  },
};
