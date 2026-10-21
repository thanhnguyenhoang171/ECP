import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { InventoryItemResponse, InventoryLedgerItemResponse } from '../api/inventory.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi, type StockAdjustment } from '../api/inventory.api';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useStocks(): UseQueryResult<InventoryItemResponse[], Error> {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: () => inventoryApi.getStocks(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryLedgers(): UseQueryResult<InventoryLedgerItemResponse[], Error> {
  return useQuery({
    queryKey: ['inventory-ledgers'],
    queryFn: () => inventoryApi.getLedgers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdjustStock(): UseMutationResult<InventoryItemResponse, unknown, StockAdjustment> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockAdjustment) =>
      inventoryApi.adjustStock(data),
    onSuccess: () => {
      toast.success('Điều chỉnh tồn kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledgers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-composite-detail'] });
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    },
    onError: (error: unknown) => {
      console.error('Adjust stock error:', error);
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi điều chỉnh tồn kho');
      toast.error(msg, { id: msg });
    }
  });
}
