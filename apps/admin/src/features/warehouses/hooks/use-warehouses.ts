import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { WarehouseFormValues } from '../schemas/warehouse.schema';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { warehouseApi } from '../api/warehouse.api';
import type { ClientWarehouse } from '@/features/inventory/types/inventory.types';

export function useWarehouses(initialData?: ClientWarehouse[]): UseQueryResult<ClientWarehouse[], Error> {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseApi.getAll(),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouse(id: string): UseQueryResult<ClientWarehouse, Error> {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehouseApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteWarehouse(): UseMutationResult<{ success: boolean }, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => warehouseApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa kho bãi thành công');
        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Xoá kho bãi thất bại'));
    },
  });
}

export function useCreateWarehouse(): UseMutationResult<ClientWarehouse, unknown, WarehouseFormValues> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WarehouseFormValues) => warehouseApi.create(data),
    onSuccess: () => {
      toast.success('Thêm kho bãi thành công');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Tạo kho bãi thất bại'));
    }
  });
}

export function useUpdateWarehouse(): UseMutationResult<ClientWarehouse, unknown, { id: string; data: WarehouseFormValues }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehouseFormValues }) => warehouseApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật kho bãi thành công');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses', variables.id] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Cập nhật kho bãi thất bại'));
    }
  });
}
