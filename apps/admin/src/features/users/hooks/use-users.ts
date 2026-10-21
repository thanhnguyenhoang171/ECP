'use client';

import type { UserListParams, UserStatistics, UserMutationData } from '../api/user.api';
import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../api/user.api';
import { PageResponse } from '@/types/pagination';
import { User } from '../types/user.interface';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useUsers(
  params: UserListParams,
  initialData?: PageResponse<User>,
): UseQueryResult<PageResponse<User>, Error> {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getPaged(params),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUser(id: string): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteUser(): UseMutationResult<{ success: boolean }, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa người dùng thành công');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['users', 'statistics'] });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể xoá tài khoản'));
    },
  });
}

export function useUserStatistics(initialData?: UserStatistics): UseQueryResult<UserStatistics, Error> {
  return useQuery({
    queryKey: ['users', 'statistics'],
    queryFn: () => userApi.getStatistics(),
    placeholderData: initialData,
    refetchInterval: 30000, // Làm tươi mỗi 30 giây
    staleTime: 10000,
  });
}

export function useCreateUser(): UseMutationResult<User, Error, UserMutationData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserMutationData) => userApi.create(data),
    onSuccess: () => {
      toast.success('Thêm người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'statistics'] });
    },
    onError: (error: Error) => {
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi thêm người dùng');
      toast.error(msg, { id: msg });
    }
  });
}

export function useUpdateUser(): UseMutationResult<User, Error, { id: string; data: UserMutationData }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserMutationData }) => userApi.update(id, data),
    onSuccess: () => {
      toast.success('Cập nhật người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'statistics'] });
    },
    onError: (error: Error) => {
      const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi cập nhật người dùng');
      toast.error(msg, { id: msg });
    }
  });
}




