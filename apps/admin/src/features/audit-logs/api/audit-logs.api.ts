import { ApiError } from '@/constants/errorMessages';
import { clientFetch } from '@/lib/clientFetch';
import { syncPagination, toApiPage } from '@/lib/utils';
import { PageResponse } from '@/types/pagination';
import { AuditLog, AuditLogParams } from '../types/audit-logs.interface';

interface AuditError {
  code?: string;
  message?: string;
}

const checkResponse = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const error: AuditError = await response.json();
    throw new ApiError(error.code || 'AUDIT_REQUEST_FAILED', error.message || 'Không thể tải nhật ký kiểm toán.', response.status);
  }
};

export const auditLogsApi = {
  getPaged: async (params: AuditLogParams): Promise<PageResponse<AuditLog>> => {
    const query = new URLSearchParams({ page: String(toApiPage(params.page)), size: String(params.size) });
    for (const [key, value] of Object.entries(params)) {
      if (key !== 'page' && key !== 'size' && value) { query.set(key, String(value)); }
    }
    const response = await clientFetch(`v1/audit-logs?${query}`, { cache: 'no-store', skipToast: true });
    await checkResponse(response);
    const result: PageResponse<AuditLog> = await response.json();
    return syncPagination(result);
  },
  getById: async (id: string): Promise<AuditLog> => {
    const response = await clientFetch(`v1/audit-logs/${encodeURIComponent(id)}`, { cache: 'no-store', skipToast: true });
    await checkResponse(response);
    const result: { data: AuditLog } = await response.json();
    return result.data;
  },
  delete: async (id: string): Promise<void> => {
    const response = await clientFetch(`v1/audit-logs/${encodeURIComponent(id)}`, { method: 'DELETE', skipToast: true });
    await checkResponse(response);
  },
};
