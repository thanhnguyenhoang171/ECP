import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { purchaseOrderApi } from '../api/purchase-order.api';
import { PurchaseOrderFormValues } from '../schemas/purchase-order.schema';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrderApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrderApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePurchaseOrder() {
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

export function useUpdatePurchaseOrder() {
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

export function useUpdatePOStatus() {
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
