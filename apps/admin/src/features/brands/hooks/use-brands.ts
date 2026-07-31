import { useQuery } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';

export const useBrands = (params: {
  page: number;
  size: number;
  sort?: string;
  name?: string;
  active?: boolean;
}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandApi.getPaged(params),
  });
};

export const useActiveBrands = () => {
  return useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => brandApi.getActive(),
  });
};
