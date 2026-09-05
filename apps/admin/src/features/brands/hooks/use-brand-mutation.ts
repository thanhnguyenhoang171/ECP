import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '../api/brand.api';
import { BrandFormValues } from '../schemas/brand.schema';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/constants/errorMessages';

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandFormValues) => brandApi.create(values),
    onSuccess: () => {
      toast.success('Tạo thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Tạo thương hiệu thất bại');
      toast.error(msg, { id: msg });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<BrandFormValues> }) =>
      brandApi.update(id, values),
    onSuccess: () => {
      toast.success('Cập nhật thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Cập nhật thương hiệu thất bại');
      toast.error(msg, { id: msg });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Xóa thương hiệu thất bại');
      toast.error(msg, { id: msg });
    },
  });
};
