'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../api/user.api';
import { PageResponse } from '@/types/pagination';
import { User } from '../types/user.interface';

export function useUsers(
  params: {
    page: number;
    size: number;
    sort?: string;
    keyword?: string;
    role?: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
    active?: boolean;
  },
  initialData?: PageResponse<User>,
) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getPaged(params),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xóa người dùng thành công');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });
}

export function useUserStatistics(initialData?: any) {
  return useQuery({
    queryKey: ['users', 'statistics'],
    queryFn: () => userApi.getStatistics(),
    placeholderData: initialData,
    refetchInterval: 30000, // Làm tươi mỗi 30 giây
    staleTime: 10000,
  });
}



