'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { categoryApi } from '../api/category.api';

export function useCategories(params: { 
  page: number; 
  size: number; 
  sort?: string;
  name?: string;
  parentId?: string;
  level?: number;
  active?: boolean;
}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getPaged(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: () => categoryApi.getParents(),
  });
}
