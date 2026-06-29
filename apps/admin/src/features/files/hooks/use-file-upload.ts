'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fileApi, CloudinaryFile } from '../api/file.api';
import { ApiResponse } from '@/types/api.interface';

export interface UploadFileParams {
  file: File;
  folder?: string;
}

export interface UploadMultipleFilesParams {
  files: File[];
  folder?: string;
}

/**
 * Hook for uploading a single file to Cloudinary
 */
export function useUploadFile() {
  return useMutation<ApiResponse<CloudinaryFile>, Error, UploadFileParams>({
    mutationFn: ({ file, folder }) => fileApi.uploadFile(file, folder),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Tải lên tập tin thành công');
      }
    },
    onError: (error) => {
      console.error('File upload error:', error);
      toast.error(error.message || 'Tải lên tập tin thất bại');
    },
  });
}

/**
 * Hook for uploading multiple files to Cloudinary
 */
export function useUploadMultipleFiles() {
  return useMutation<ApiResponse<CloudinaryFile[]>, Error, UploadMultipleFilesParams>({
    mutationFn: ({ files, folder }) => fileApi.uploadMultipleFiles(files, folder),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`Tải lên ${response.data.length} tập tin thành công`);
      }
    },
    onError: (error) => {
      console.error('Multiple files upload error:', error);
      toast.error(error.message || 'Tải lên danh sách tập tin thất bại');
    },
  });
}

/**
 * Hook for deleting a file from Cloudinary
 */
export function useDeleteFile() {
  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: (publicId) => fileApi.deleteFile(publicId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Xóa tập tin thành công');
      }
    },
    onError: (error) => {
      console.error('File deletion error:', error);
      toast.error(error.message || 'Xóa tập tin thất bại');
    },
  });
}
