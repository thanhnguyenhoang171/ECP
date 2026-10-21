import type { QueryClient } from '@tanstack/react-query';

const BUSINESS_QUERY_KEYS = new Set([
  'products', 'product', 'product-composite-detail', 'skus', 'categories', 'category', 'brands',
  'stocks', 'inventory', 'inventory-ledgers', 'inventory-stocks-modal', 'goods-receipts',
  'purchase-orders', 'suppliers', 'warehouses', 'dashboard',
]);

export const refreshPurgedBusinessData = async (queryClient: QueryClient): Promise<void> => {
  // Drop old business results (including inactive detail pages) before refetching.
  // Account, permission, profile and purge-password caches stay intact.
  await queryClient.resetQueries({
    predicate: query => typeof query.queryKey[0] === 'string' && BUSINESS_QUERY_KEYS.has(query.queryKey[0]),
  });
  await queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
};
