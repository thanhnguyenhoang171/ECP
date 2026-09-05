import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi } from '../api/supplier.api';
import { ClientSupplier } from '@/lib/clientDb';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useSuppliers(initialData?: ClientSupplier[]) {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierApi.getAll(),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa nhà cung cấp thành công');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      }
    },
    onError: (error: unknown) => {
      console.error('Delete supplier error:', error);
      const msg = getApiErrorMessage(error, 'Xóa nhà cung cấp thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => supplierApi.create(data),
    onSuccess: () => {
      toast.success('Thêm nhà cung cấp thành công');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi thêm nhà cung cấp');
      toast.error(msg, { id: msg });
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => supplierApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật nhà cung cấp thành công');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật nhà cung cấp');
      toast.error(msg, { id: msg });
    }
  });
}
