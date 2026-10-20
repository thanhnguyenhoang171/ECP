'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { systemApi, type PurgePasswordStatus } from '../api/system.api';

export const usePurgePasswordStatus = (enabled = true): UseQueryResult<PurgePasswordStatus, Error> => {
  const { user, isInitialized } = useAuthStore();
  return useQuery({
    queryKey: ['purge-password-status', user?.id],
    queryFn: systemApi.getPurgePasswordStatus,
    enabled: enabled && isInitialized && Boolean(user?.id),
    retry: false,
    staleTime: 0,
  });
};
