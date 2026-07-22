import { useQuery } from '@tanstack/react-query';
import { skuApi } from '../api/sku.api';

export const useSkus = (params: {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  productId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['skus', params],
    queryFn: () => skuApi.getPaged(params),
  });
};
