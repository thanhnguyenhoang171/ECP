'use client';

import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { PageResponse } from '@/types/pagination';
import { auditLogsApi } from '../api/audit-logs.api';
import { AuditLog, AuditLogParams } from '../types/audit-logs.interface';

export function useAuditLogs(params: AuditLogParams & { enabled?: boolean }): UseQueryResult<PageResponse<AuditLog>, Error> {
  const { enabled = true, ...queryParams } = params;
  return useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => auditLogsApi.getPaged(queryParams),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useDeleteAuditLog(): UseMutationResult<void, Error, string> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: auditLogsApi.delete,
    onSuccess: () => {
      toast.success('Đã xoá nhật ký.');
      void client.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: error => { toast.error(getApiErrorMessage(error, 'Không thể xoá nhật ký.')); },
  });
}
