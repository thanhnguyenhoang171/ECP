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
    placeholderData: (previousData) => previousData,
  });
};

export const useActiveBrands = () => {
  return useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => brandApi.getActive(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
