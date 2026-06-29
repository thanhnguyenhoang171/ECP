'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/category.api';
import { PageResponse } from '@/types/pagination';
import { Category } from '../types/category.interface';

export function useCategories(
  params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    id?: string;
    parentId?: string;
    level?: number;
    active?: boolean;
  },
  initialData?: PageResponse<Category>,
) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getPaged(params),
    placeholderData: initialData, // Sử dụng dữ liệu ban đầu làm placeholder
    staleTime: 30 * 1000, // 30 giây - cache ngắn hơn để dữ liệu mới hơn
    refetchOnWindowFocus: true, // Refetch khi focus lại window
  });
}

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: () => categoryApi.getParents(),
    staleTime: 30 * 1000, // 30 giây
    refetchOnWindowFocus: true,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 giây
    refetchOnWindowFocus: true,
  });
}
