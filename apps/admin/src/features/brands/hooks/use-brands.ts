import { useQuery } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { BaseQueryParams } from '@/types/api.interface';

export const useBrands = (params: BaseQueryParams) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandApi.getBrands(params),
  });
};

export const useBrandStats = () => {
  return useQuery({
    queryKey: ['brands', 'stats'],
    queryFn: () => brandApi.getStats(),
  });
};
