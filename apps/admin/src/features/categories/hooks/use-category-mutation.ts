'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from '../actions/category.action';
import { CategoryFormValues } from '../schemas/category.schema';

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CategoryFormValues) => createCategoryAction(values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Tạo danh mục thành công');
        // Làm mới danh sách categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.message || 'Có lỗi xảy ra');
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối server';
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) => 
      updateCategoryAction(id, values),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Cập nhật danh mục thành công');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.message || 'Có lỗi xảy ra');
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối server';
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa danh mục thành công');
        // Làm mới danh sách categories
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.message || 'Không thể xóa danh mục');
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Lỗi kết nối server';
      toast.error(message);
    },
  });
}
