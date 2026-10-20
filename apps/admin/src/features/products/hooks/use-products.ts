import { useQuery } from '@tanstack/react-query';
import { productApi, type ProductListParams } from '../api/product.api';
import { PageResponse } from '@/types/pagination';
import { Product } from '../types/product.interface';

export const useProducts = (
  params: ProductListParams,
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
