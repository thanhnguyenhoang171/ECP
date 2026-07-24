'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/audit-logs.api';

export function useAuditLogs(params: {
  page: number;
  size: number;
  sort?: string;
  action?: string;
  username?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => auditLogsApi.getPaged(queryParams),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
