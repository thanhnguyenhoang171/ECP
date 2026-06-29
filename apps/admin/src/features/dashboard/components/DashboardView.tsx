'use client';

import React from 'react';
import {  Badge, Button, PageHeader, Breadcrumbs } from '@/components/common';
import { DashboardStat, RecentOrder, TopProduct } from '@/features/dashboard/types/dashboard.interface';
import StatsGrid from './StatsGrid';
import RevenueChartCard from './RevenueChartCard';
import TopProductsCard from './TopProductsCard';
import RecentOrdersCard from './RecentOrdersCard';
import { RefreshCcw, LayoutDashboard } from 'lucide-react';
import { usePurgeDatabase } from '../hooks/use-dashboard-mutation';

interface DashboardViewProps {
  stats: DashboardStat[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export default function DashboardView({ stats, recentOrders, topProducts }: DashboardViewProps) {

  const { mutate: mutationPurgeDatabase } = usePurgeDatabase();

  const breadcrumbItems = [
    { label: 'Tổng quan', icon: LayoutDashboard },
  ];

  const handlePurgeDatabase = () => {
    mutationPurgeDatabase();
  };  

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title='Tổng quan'
        description='Chào mừng bạn quay trở lại! Dưới đây là tình hình kinh doanh hôm nay.'
        actions={
          <>
            <Button onClick={handlePurgeDatabase} variant='outline' size='sm' className='h-9 gap-2'>
              <RefreshCcw size={14} />
              Làm mới
            </Button>
            <Badge variant='secondary' className='h-9 px-4 text-sm font-medium'>
              Hôm nay
            </Badge>
          </>
        }
      />

      <StatsGrid stats={stats} />

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <RevenueChartCard />
        <TopProductsCard topProducts={topProducts} />
      </div>

      <RecentOrdersCard recentOrders={recentOrders} />
    </div>
  );
}
