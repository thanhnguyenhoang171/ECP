import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { goodsReceiptApi } from '../api/goods-receipt.api';
import { GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';

export function useGoodsReceipts() {
  return useQuery({
    queryKey: ['goods-receipts'],
    queryFn: () => goodsReceiptApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: ['goods-receipts', id],
    queryFn: () => goodsReceiptApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: GoodsReceiptFormValues) => goodsReceiptApi.create(values),
    onSuccess: () => {
      toast.success('Tạo phiếu nhập kho mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
    onError: (error: any) => {
      console.error('Create goods receipt error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo phiếu nhập kho');
    },
  });
}

export function useConfirmGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptApi.confirm(id),
    onSuccess: (_, id) => {
      toast.success('Xác nhận nhập kho thành công! Tồn kho đã được cập nhật.');
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts', id] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
    onError: (error: any) => {
      console.error('Confirm goods receipt error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi xác nhận phiếu nhập kho');
    },
  });
}

export function useUpdateGoodsReceiptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => goodsReceiptApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Cập nhật trạng thái phiếu nhập sang ${variables.status} thành công!`);
      queryClient.invalidateQueries({ queryKey: ['goods-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['goods-receipts', variables.id] });
    },
    onError: (error: any) => {
      console.error('Update goods receipt status error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái phiếu nhập');
    },
  });
}
