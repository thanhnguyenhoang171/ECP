'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard(period: '12m' | '30d' | '7d' = '12m') {
  return useQuery({
    queryKey: ['dashboard', 'overview', period],
    queryFn: () => dashboardApi.getOverview(period),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
