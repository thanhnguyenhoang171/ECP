import { useQuery, useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult, type UseQueryResult } from '@tanstack/react-query';
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
): UseQueryResult<PageResponse<Brand>, Error> => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandApi.getPaged(params),
    placeholderData: (previousData) => previousData,
    initialData,
  });
};

export const useActiveBrands = (name = ''): UseQueryResult<PageResponse<Brand>, Error> => {
  return useQuery({
    queryKey: ['brands', 'active', name],
    queryFn: () => brandApi.getActive({ name }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useBrand = (id: string): UseQueryResult<Brand, Error> => {
  return useQuery({
    queryKey: ['brands', id],
    queryFn: () => brandApi.getById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};


export const useInfiniteBrands = (
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<PageResponse<Brand>>, Error> => {
  return useInfiniteQuery({
    queryKey: ['brands', 'infinite'],
    queryFn: ({ pageParam }) => brandApi.getPaged({ page: pageParam, size: 20, sort: 'name,asc' }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, last } = lastPage.pagination;
      return last || currentPage >= totalPages ? undefined : currentPage + 1;
    },
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
