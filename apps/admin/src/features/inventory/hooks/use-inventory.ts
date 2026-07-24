import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '../api/inventory.api';

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: () => inventoryApi.getStocks(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryLedgers() {
  return useQuery({
    queryKey: ['inventory-ledgers'],
    queryFn: () => inventoryApi.getLedgers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { warehouseId: string; skuId: string; batchCode?: string; quantityDelta: number; reason?: string }) => 
      inventoryApi.adjustStock(data),
    onSuccess: () => {
      toast.success('Điều chỉnh tồn kho thành công!');
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledgers'] });
    },
    onError: (error: any) => {
      console.error('Adjust stock error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi điều chỉnh tồn kho');
    }
  });
}
