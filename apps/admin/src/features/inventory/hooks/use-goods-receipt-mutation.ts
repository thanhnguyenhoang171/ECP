import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ClientGoodsReceipt } from '@/features/inventory/types/inventory.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { goodsReceiptApi } from '../api/goods-receipt.api';
import { GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useGoodsReceipts(): UseQueryResult<ClientGoodsReceipt[], Error> {
  return useQuery({
    queryKey: ['goods-receipts'],
    queryFn: () => goodsReceiptApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoodsReceipt(id: string): UseQueryResult<ClientGoodsReceipt, Error> {
  return useQuery({
    queryKey: ['goods-receipts', id],
    queryFn: () => goodsReceiptApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGoodsReceipt(): UseMutationResult<ClientGoodsReceipt, unknown, GoodsReceiptFormValues> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: GoodsReceiptFormValues) => goodsReceiptApi.create(values),
    onSuccess: () => {
      toast.success('Tạo phiếu nhập kho mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-composite-detail'] });
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    },
    onError: (error: unknown) => {
      console.error('Create goods receipt error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi tạo phiếu nhập kho');
      toast.error(msg, { id: msg });
    },
  });
}

export function useConfirmGoodsReceipt(): UseMutationResult<ClientGoodsReceipt, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptApi.confirm(id),
    onSuccess: (_, id) => {
      toast.success('Xác nhận nhập kho thành công! Tồn kho đã được cập nhật.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts', id] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-composite-detail'] });
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    },
    onError: (error: unknown) => {
      console.error('Confirm goods receipt error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi xác nhận phiếu nhập kho');
      toast.error(msg, { id: msg });
    },
  });
}

export function useUpdateGoodsReceiptStatus(): UseMutationResult<ClientGoodsReceipt, unknown, { id: string; status: string }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => goodsReceiptApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật trạng thái phiếu nhập sang ${variables.status} thành công!`);
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts', variables.id] });
    },
    onError: (error: unknown) => {
      console.error('Update goods receipt status error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật trạng thái phiếu nhập');
      toast.error(msg, { id: msg });
    },
  });
}

export const useDeleteGoodsReceipt = (): UseMutationResult<void, unknown, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: goodsReceiptApi.delete,
    onSuccess: async () => {
      toast.success('Đã xoá phiếu nhập nháp');
      await queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: unknown) => { toast.error(getApiErrorMessage(error, 'Xoá phiếu nhập thất bại')); },
  });
};

export const useUpdateGoodsReceipt = (): UseMutationResult<ClientGoodsReceipt, unknown, { id: string; values: GoodsReceiptFormValues }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: GoodsReceiptFormValues }) => goodsReceiptApi.update(id, values),
    onSuccess: async () => {
      toast.success('Đã cập nhật phiếu nhập nháp');
      await queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
    },
    onError: (error: unknown) => { toast.error(getApiErrorMessage(error, 'Cập nhật phiếu nhập thất bại')); },
  });
};
