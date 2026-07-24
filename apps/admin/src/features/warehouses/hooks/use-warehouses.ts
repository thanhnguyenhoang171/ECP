import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { warehouseApi } from '../api/warehouse.api';
import { ClientWarehouse } from '@/lib/clientDb';

export function useWarehouses(initialData?: ClientWarehouse[]) {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseApi.getAll(),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehouseApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa kho bãi thành công');
        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      }
    },
    onError: (error: any) => {
      console.error('Delete warehouse error:', error);
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => warehouseApi.create(data),
    onSuccess: () => {
      toast.success('Thêm kho bãi thành công');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: any) => {
      console.error('Create warehouse error:', error);
    }
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => warehouseApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật kho bãi thành công');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses', variables.id] });
    },
    onError: (error: any) => {
      console.error('Update warehouse error:', error);
    }
  });
}
