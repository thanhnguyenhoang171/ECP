import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';

interface UseProductsParams {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  categoryId?: string;
}

export const useProducts = (params: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getPaged(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching next page
  });
};

export const useProductDetail = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id!),
    enabled: !!id,
  });
};
