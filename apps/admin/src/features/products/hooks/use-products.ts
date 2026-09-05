import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';
import { PageResponse } from '@/types/pagination';
import { Product } from '../types/product.interface';

interface UseProductsParams {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  categoryId?: string;
}

export const useProducts = (
  params: UseProductsParams,
  initialData?: PageResponse<Product>,
) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getPaged(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching next page
    initialData,
    retry: (failureCount, err) => {
      if ((err as unknown as { status?: number })?.status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
  });
};

export const useProductCompositeDetail = (id?: string) => {
  return useQuery({
    queryKey: ['product-composite-detail', id],
    queryFn: () => productApi.getDetail(id!),
    enabled: !!id,
  });
};
