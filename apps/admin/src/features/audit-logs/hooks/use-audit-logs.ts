'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/audit-logs.api';

export function useAuditLogs(params: {
  page: number;
  size: number;
  sort?: string;
  action?: string;
  username?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogsApi.getPaged(params),
    staleTime: 30 * 1000, // Audit logs might change frequently
  });
}
