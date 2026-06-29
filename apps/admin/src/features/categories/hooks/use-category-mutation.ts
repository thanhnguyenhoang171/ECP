'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoryApi } from '../api/category.api';
import { CategoryFormValues } from '../schemas/category.schema';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => categoryApi.create(values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Tạo danh mục thành công');
        // Invalidate tất cả queries liên quan đến categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['categories', 'parents'] });
      } else {
        // toast.error is handled globally by clientFetch
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      // toast.error is handled globally by clientFetch
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      categoryApi.update(id, values),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success('Cập nhật danh mục thành công');
        // Invalidate tất cả queries liên quan đến categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['categories', 'parents'] });
      } else {
        // toast.error is handled globally by clientFetch
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      // toast.error is handled globally by clientFetch
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa danh mục thành công');
        // Invalidate tất cả queries liên quan đến categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['categories', 'parents'] });
      } else {
        // toast.error is handled globally by clientFetch
      }
    },
    onError: (error) => {
      console.error("Delete error:", error);
      // toast.error is handled globally by clientFetch
    },
  });
}

export function useImportCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => categoryApi.import(file),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Nhập dữ liệu danh mục thành công');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    },
    onError: (error) => {
      console.error("Import error:", error);
      // toast.error is handled globally by clientFetch
    },
  });
}
