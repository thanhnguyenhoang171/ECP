import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ClientPurchaseOrder } from '@/features/inventory/types/inventory.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseOrderApi } from '../api/purchase-order.api';
import { PurchaseOrderFormValues } from '../schemas/purchase-order.schema';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function usePurchaseOrders(): UseQueryResult<ClientPurchaseOrder[], Error> {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrderApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrder(id: string): UseQueryResult<ClientPurchaseOrder, Error> {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrderApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder(): UseMutationResult<ClientPurchaseOrder, unknown, PurchaseOrderFormValues> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PurchaseOrderFormValues) => purchaseOrderApi.create(values),
    onSuccess: () => {
      toast.success('Tạo Đơn mua hàng mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: unknown) => {
      console.error('Create purchase order error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi tạo Đơn mua hàng');
      toast.error(msg, { id: msg });
    },
  });
}

export function useUpdatePurchaseOrder(): UseMutationResult<ClientPurchaseOrder, unknown, { id: string; values: PurchaseOrderFormValues }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PurchaseOrderFormValues }) =>
      purchaseOrderApi.update(id, values),
    onSuccess: (_, variables) => {
      toast.success('Cập nhật Đơn mua hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
    },
    onError: (error: unknown) => {
      console.error('Update purchase order error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật Đơn mua hàng');
      toast.error(msg, { id: msg });
    },
  });
}

export function useUpdatePOStatus(): UseMutationResult<ClientPurchaseOrder, unknown, { id: string; status: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => purchaseOrderApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật trạng thái Đơn PO sang ${variables.status} thành công!`);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
    },
    onError: (error: unknown) => {
      console.error('Update PO status error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật trạng thái PO');
      toast.error(msg, { id: msg });
    },
  });
}

export const useDeletePurchaseOrder = (): UseMutationResult<void, unknown, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrderApi.delete,
    onSuccess: async () => {
      toast.success('Đã xoá đơn mua hàng nháp');
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
    onError: (error: unknown) => { toast.error(getApiErrorMessage(error, 'Xoá đơn mua hàng thất bại')); },
  });
};
