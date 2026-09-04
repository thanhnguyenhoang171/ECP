import { useQuery } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { PageResponse } from '@/types/pagination';
import { Brand } from '../types/brand.interface';

export const useBrands = (
  params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    active?: boolean;
  },
  initialData?: PageResponse<Brand>,
) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandApi.getPaged(params),
    placeholderData: (previousData) => previousData,
    initialData,
  });
};

export const useActiveBrands = () => {
  return useQuery({
    queryKey: ['brands', 'active'],
    queryFn: () => brandApi.getActive(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandApi.getById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

