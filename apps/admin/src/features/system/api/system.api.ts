import { ApiError } from '@/constants/errorMessages';
import { clientFetch } from '@/lib/clientFetch';

export interface PurgePasswordStatus {
  configured: boolean;
  approved: boolean;
  canApprove: boolean;
}

export interface PurgePasswordApproval {
  userId: string;
  email: string;
  updatedAt: string;
  version: number;
}

interface SystemResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await clientFetch(path, { ...options, skipToast: true });
  const result: SystemResponse<T> = await response.json();
  if (!response.ok || !result.success) {
    throw new ApiError(result.code || 'SYSTEM_REQUEST_FAILED', result.message || 'Không thể thực hiện thao tác', response.status, result);
  }
  return result.data;
};

export const systemApi = {
  getPurgePasswordStatus: (): Promise<PurgePasswordStatus> => request('v1/system/purge-password', { cache: 'no-store' }),
  setPurgePassword: (values: { currentPassword?: string; newPassword: string }): Promise<void> => request('v1/system/purge-password', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
  }),
  getPendingApprovals: (): Promise<PurgePasswordApproval[]> => request('v1/system/purge-password/approvals', { cache: 'no-store' }),
  approvePassword: (values: { userId: string; version: number }): Promise<void> => request(`v1/system/purge-password/${values.userId}/approve`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: values.version }),
  }),
  purge: (password: string): Promise<string> => request('v1/system/purge', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }),
};
