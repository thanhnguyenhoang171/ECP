import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi } from '../api/supplier.api';
import { ClientSupplier } from '@/lib/clientDb';

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
    onError: (error: any) => {
      console.error('Delete supplier error:', error);
    },
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => supplierApi.create(data),
    onSuccess: () => {
      toast.success('Thêm nhà cung cấp thành công');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi thêm nhà cung cấp');
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => supplierApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật nhà cung cấp thành công');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật nhà cung cấp');
    }
  });
}
