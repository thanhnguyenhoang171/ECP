'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fileApi, CloudinaryFile } from '../api/file.api';
import { ApiResponse } from '@/types/api.interface';
import { getApiErrorMessage } from '@/constants/errorMessages';

export interface UploadFileParams {
  file: File;
  folder?: string;
  skipToast?: boolean;
}

export interface UploadMultipleFilesParams {
  files: File[];
  folder?: string;
  skipToast?: boolean;
}

/**
 * Hook for uploading a single file to Cloudinary
 */
export function useUploadFile() {
  return useMutation<ApiResponse<CloudinaryFile>, Error, UploadFileParams>({
    mutationFn: ({ file, folder }) => fileApi.uploadFile(file, folder),
    onSuccess: (response, variables) => {
      if (response.success && !variables.skipToast) {
        toast.success('Tải lên tập tin thành công');
      }
    },
    onError: (error: unknown) => {
      console.error('File upload error:', error);
      const msg = getApiErrorMessage(error, 'Tải lên tập tin thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

/**
 * Hook for uploading multiple files to Cloudinary
 */
export function useUploadMultipleFiles() {
  return useMutation<ApiResponse<CloudinaryFile[]>, Error, UploadMultipleFilesParams>({
    mutationFn: ({ files, folder }) => fileApi.uploadMultipleFiles(files, folder),
    onSuccess: (response, variables) => {
      if (response.success && !variables.skipToast) {
        toast.success(`Tải lên ${response.data.length} tập tin thành công`);
      }
    },
    onError: (error: unknown) => {
      console.error('Multiple files upload error:', error);
      const msg = getApiErrorMessage(error, 'Tải lên danh sách tập tin thất bại');
      toast.error(msg, { id: msg });
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
    onError: (error: unknown) => {
      console.error('File deletion error:', error);
      const msg = getApiErrorMessage(error, 'Xóa tập tin thất bại');
      toast.error(msg, { id: msg });
    },
  });
}
