'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ProductFormValues } from '../schemas/product.schema';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProductFormValues) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...values, id: crypto.randomUUID() };
    },
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Tạo sản phẩm thất bại');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProductFormValues }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { ...values, id };
    },
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Cập nhật sản phẩm thất bại');
    },
  });
}
