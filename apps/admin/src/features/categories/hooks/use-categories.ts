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
    staleTime: 5 * 60 * 1000,
  });
}

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: () => categoryApi.getParents(),
  });
}
