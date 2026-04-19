import { useQuery } from '@tanstack/react-query';
import { productService } from '../api/services/productService';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });
};

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};
