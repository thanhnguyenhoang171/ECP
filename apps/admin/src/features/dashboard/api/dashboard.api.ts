import { clientFetch } from '@/lib/clientFetch';
import { DashboardOverviewResponse } from '../types/dashboard.interface';

export const dashboardApi = {
  getOverview: async (period: '12m' | '30d' | '7d' = '12m'): Promise<DashboardOverviewResponse> => {
    const res = await clientFetch(`v1/dashboard/overview?period=${period}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải dữ liệu bảng điều khiển');
    }

    const body = await res.json();
    return body.data || body;
  },
};
