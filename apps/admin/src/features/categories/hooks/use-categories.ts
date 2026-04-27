'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { categoryApi } from '../api/category.api';

export function useCategories(
  params: {
    page: number;
    size: number;
    sort?: string;
    name?: string;
    parentId?: string;
    level?: number;
    active?: boolean;
  },
  initialData?: PageResponse<Category>,
) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getPaged(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    initialData: initialData, // Sử dụng dữ liệu từ server truyền xuống
  });
}

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: () => categoryApi.getParents(),
  });
}
