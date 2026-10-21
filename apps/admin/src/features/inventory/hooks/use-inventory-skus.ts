'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Sku } from '@/features/skus/types/sku.interface';
import { warehouseList } from '../api/warehouse-request';

export const useInventorySkus = (): UseQueryResult<Sku[], Error> => useQuery({
  queryKey: ['skus', 'inventory-options'],
  queryFn: () => warehouseList<Sku>('v1/skus?active=true'),
  staleTime: 60_000,
});
