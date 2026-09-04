'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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
    isFeatured?: boolean;
  },
  initialData?: PageResponse<Category>,
) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getPaged(params),
    placeholderData: (previousData) => previousData || initialData,
    staleTime: 30 * 1000, // 30 giây - cache ngắn hơn để dữ liệu mới hơn
    refetchOnWindowFocus: true, // Refetch khi focus lại window
  });
}

export function useInfiniteCategories(
  params?: {
    size?: number;
    sort?: string;
    name?: string;
    parentId?: string;
    active?: boolean;
  },
  options?: {
    enabled?: boolean;
  },
) {
  return useInfiniteQuery({
    queryKey: ['categories', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      categoryApi.getPaged({
        page: pageParam,
        size: params?.size ?? 20,
        sort: params?.sort,
        name: params?.name,
        parentId: params?.parentId,
        active: params?.active,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, last } = lastPage.pagination;
      if (last || currentPage >= totalPages) {
        return undefined;
      }
      return currentPage + 1;
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
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
