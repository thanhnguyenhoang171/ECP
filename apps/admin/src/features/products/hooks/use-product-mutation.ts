'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductFormValues } from '../schemas/product.schema';
import { productApi } from '../api/product.api';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProductFormValues) => {
      return productApi.create(values);
    },
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Tạo sản phẩm thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProductFormValues }) => {
      return productApi.update(id, values);
    },
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Cập nhật sản phẩm thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return productApi.delete(id);
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Xóa sản phẩm thất bại');
      toast.error(msg, { id: msg });
    },
  });
}
