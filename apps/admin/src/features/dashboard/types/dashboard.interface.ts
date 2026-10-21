import React from 'react';

export interface DashboardStat {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface RecentOrder {
  id: string;
  orderCode?: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

export interface TopProduct {
  id?: string;
  name: string;
  sales: number;
  revenue: string;
  initials: string;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  profit: number;
}

export interface DashboardStatsDto {
  totalRevenue: number;
  totalRevenueFormatted: string;
  totalRevenueTrend: 'up' | 'down' | 'neutral';
  totalRevenueDescription: string;

  newOrdersCount: number;
  newOrdersFormatted: string;
  newOrdersTrend: 'up' | 'down' | 'neutral';
  newOrdersDescription: string;

  newCustomersCount: number;
  newCustomersFormatted: string;
  newCustomersTrend: 'up' | 'down' | 'neutral';
  newCustomersDescription: string;

  lowStockCount: number;
  lowStockFormatted: string;
  lowStockTrend: 'up' | 'down' | 'neutral';
  lowStockDescription: string;
}

export interface DashboardRecentOrderDto {
  id: string;
  orderCode: string;
  customer: string;
  amount: number;
  amountFormatted: string;
  status: string;
  date: string;
  dateFormatted: string;
}

export interface DashboardTopProductDto {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  revenueFormatted: string;
  initials: string;
}

export interface DashboardChartPointDto {
  label: string;
  revenue: number;
  profit: number;
}

export interface DashboardOverviewResponse {
  stats: DashboardStatsDto;
  recentOrders: DashboardRecentOrderDto[];
  topProducts: DashboardTopProductDto[];
  chartData: DashboardChartPointDto[];
}
