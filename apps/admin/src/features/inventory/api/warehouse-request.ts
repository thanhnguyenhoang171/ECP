import { ApiError } from '@/constants/errorMessages';
import { clientFetch } from '@/lib/clientFetch';
import type { PageResponse } from '@/types/pagination';

interface ApiResult<T> {
  success: boolean;
  data: T;
  code?: string;
  message?: string;
  validationErrors?: Record<string, string>;
}

export const warehouseRequest = async <T>(path: string, method = 'GET', data?: unknown): Promise<T> => {
  const response = await clientFetch(path, {
    method,
    ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  const result: ApiResult<T> = await response.json();
  if (!response.ok || !result.success) {
    const detail = result.validationErrors ? Object.values(result.validationErrors).join(', ') : result.message;
    throw new ApiError(result.code || 'WAREHOUSE_REQUEST_FAILED', detail || 'Không thể xử lý yêu cầu kho hàng', response.status, result);
  }
  return result.data;
};

// Existing list screens filter locally; retrieve every API page rather than silently showing only page one.
export const warehouseList = async <T>(path: string): Promise<T[]> => {
  const items: T[] = [];
  for (let page = 0; ; page += 1) {
    const query = `${path}${path.includes('?') ? '&' : '?'}page=${page}&size=100`;
    const response = await clientFetch(query);
    const result: PageResponse<T> = await response.json();
    if (!response.ok || !result.success) {
      throw new ApiError(response.status === 403 ? 'AUTH_ACCESS_DENIED' : 'WAREHOUSE_LIST_FAILED',
        result.message || 'Không thể tải dữ liệu kho hàng', response.status, result);
    }
    items.push(...result.data);
    if (page + 1 >= result.pagination.totalPages || result.data.length === 0) { return items; }
  }
};
