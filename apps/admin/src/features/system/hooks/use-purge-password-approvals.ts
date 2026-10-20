'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { systemApi, type PurgePasswordApproval } from '../api/system.api';

export const usePurgePasswordApprovals = (): UseQueryResult<PurgePasswordApproval[], Error> => {
  const { user, isInitialized } = useAuthStore();
  const isAdmin = user?.roles?.some((role) => role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') === true;

  return useQuery({
    queryKey: ['purge-password-approvals', user?.id],
    queryFn: systemApi.getPendingApprovals,
    enabled: isInitialized && Boolean(user?.id) && isAdmin,
    retry: false,
    staleTime: 10000,
    refetchInterval: 30000,
  });
};
