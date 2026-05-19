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
        // Làm mới danh sách categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Cập nhật danh mục thành công');
        // Làm mới toàn bộ cache liên quan đến categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        // Làm mới danh sách categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
