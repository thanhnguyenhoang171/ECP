'use client';

import React, { useState, useMemo } from 'react';
import { Badge, Button, PageHeader, Breadcrumbs } from '@/components/common';
import {
  DashboardStat,
  RecentOrder,
  TopProduct,
  ChartDataPoint,
} from '@/features/dashboard/types/dashboard.interface';
import StatsGrid from './StatsGrid';
import RevenueChartCard from './RevenueChartCard';
import TopProductsCard from './TopProductsCard';
import RecentOrdersCard from './RecentOrdersCard';
import {
  RefreshCcw,
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Users as UsersIcon,
  Package,
} from 'lucide-react';
import { useDashboard } from '../hooks/use-dashboard';
import { toast } from 'sonner';

interface DashboardViewProps {
  initialStats?: DashboardStat[];
  initialRecentOrders?: RecentOrder[];
  initialTopProducts?: TopProduct[];
}

export default function DashboardView({
  initialStats,
  initialRecentOrders,
  initialTopProducts,
}: DashboardViewProps): React.JSX.Element {
  const [chartPeriod, setChartPeriod] = useState<'12m' | '30d' | '7d'>('12m');

  const {
    data: dashboardData,
    isFetching,
    refetch,
  } = useDashboard(chartPeriod);

  const breadcrumbItems = [{ label: 'Tổng quan', icon: LayoutDashboard }];

  const handleRefresh = async (): Promise<void> => {
    try {
      await refetch();
      toast.success('Đã cập nhật dữ liệu mới nhất');
    } catch {
      toast.error('Lỗi khi làm mới dữ liệu');
    }
  };

  const stats: DashboardStat[] = useMemo(() => {
    if (!dashboardData?.stats) {
      return (
        initialStats || [
          {
            title: 'Tổng doanh thu',
            value: '0 đ',
            description: 'Chưa có dữ liệu',
            icon: <DollarSign className="h-4 w-4 text-blue-500" />,
            trend: 'neutral',
            color: 'border-l-4 border-l-blue-500',
          },
          {
            title: 'Đơn hàng mới',
            value: '0',
            description: 'Chưa có dữ liệu',
            icon: <ShoppingCart className="h-4 w-4 text-orange-500" />,
            trend: 'neutral',
            color: 'border-l-4 border-l-orange-500',
          },
          {
            title: 'Khách hàng mới',
            value: '0',
            description: 'Chưa có dữ liệu',
            icon: <UsersIcon className="h-4 w-4 text-green-500" />,
            trend: 'neutral',
            color: 'border-l-4 border-l-green-500',
          },
          {
            title: 'Sản phẩm sắp hết',
            value: '0',
            description: 'Chưa có dữ liệu',
            icon: <Package className="h-4 w-4 text-purple-500" />,
            trend: 'neutral',
            color: 'border-l-4 border-l-purple-500',
          },
        ]
      );
    }

    const s = dashboardData.stats;
    return [
      {
        title: 'Tổng giá trị nhập',
        value: s.totalRevenueFormatted || '0 đ',
        description: s.totalRevenueDescription || 'Tổng giá trị đơn nhập hàng',
        icon: <DollarSign className="h-4 w-4 text-blue-500" />,
        trend: s.totalRevenueTrend || 'neutral',
        color: 'border-l-4 border-l-blue-500',
      },
      {
        title: 'Đơn đặt hàng',
        value: s.newOrdersFormatted || '0',
        description: s.newOrdersDescription || 'Tổng đơn đặt hàng',
        icon: <ShoppingCart className="h-4 w-4 text-orange-500" />,
        trend: s.newOrdersTrend || 'neutral',
        color: 'border-l-4 border-l-orange-500',
      },
      {
        title: 'Người dùng',
        value: s.newCustomersFormatted || '0',
        description: s.newCustomersDescription || 'Tổng người dùng hệ thống',
        icon: <UsersIcon className="h-4 w-4 text-green-500" />,
        trend: s.newCustomersTrend || 'neutral',
        color: 'border-l-4 border-l-green-500',
      },
      {
        title: 'Sản phẩm sắp hết',
        value: s.lowStockFormatted || '0',
        description: s.lowStockDescription || 'Tồn kho an toàn',
        icon: <Package className="h-4 w-4 text-purple-500" />,
        trend: s.lowStockTrend || 'neutral',
        color: 'border-l-4 border-l-purple-500',
      },
    ];
  }, [dashboardData?.stats, initialStats]);

  const dashboardRecentOrders = dashboardData?.recentOrders;
  const dashboardTopProducts = dashboardData?.topProducts;
  const dashboardChartData = dashboardData?.chartData;

  const recentOrders: RecentOrder[] = useMemo(() => {
    if (!dashboardRecentOrders) {
      return initialRecentOrders || [];
    }
    return dashboardRecentOrders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      customer: o.customer,
      amount: o.amountFormatted,
      status: o.status,
      date: o.dateFormatted,
    }));
  }, [dashboardRecentOrders, initialRecentOrders]);

  const topProducts: TopProduct[] = useMemo(() => {
    if (!dashboardTopProducts) {
      return initialTopProducts || [];
    }
    return dashboardTopProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sales: p.sales,
      revenue: p.revenueFormatted,
      initials: p.initials,
    }));
  }, [dashboardTopProducts, initialTopProducts]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!dashboardChartData) {
      return [];
    }
    return dashboardChartData.map((c) => ({
      label: c.label,
      revenue: Number(c.revenue || 0),
      profit: Number(c.profit || 0),
    }));
  }, [dashboardChartData]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Tổng quan"
        description="Chào mừng bạn quay trở lại! Dưới đây là tình hình hoạt động kinh doanh hôm nay."
        actions={
          <>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isFetching}
              className="h-9 gap-2 cursor-pointer"
            >
              <RefreshCcw size={14} className={isFetching ? 'animate-spin' : ''} />
              Làm mới
            </Button>
            <Badge variant="secondary" className="h-9 px-4 text-sm font-medium">
              Hôm nay
            </Badge>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChartCard
          period={chartPeriod}
          onPeriodChange={setChartPeriod}
          chartData={chartData}
        />
        <TopProductsCard topProducts={topProducts} />
      </div>

      <RecentOrdersCard recentOrders={recentOrders} />
    </div>
  );
}
