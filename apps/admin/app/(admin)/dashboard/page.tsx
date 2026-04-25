import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users as UsersIcon,
  Package,
} from 'lucide-react';
import DashboardView from '@/features/dashboard/components/DashboardView';
import { DashboardStat, RecentOrder, TopProduct } from '@/features/dashboard/types/dashboard.interface';

export default async function DashboardPage() {
  // Giả lập Server Data Fetching
  const stats: DashboardStat[] = [
    {
      title: 'Tổng doanh thu',
      value: '128,450,000 đ',
      description: '+12% so với hôm qua',
      icon: <DollarSign className='h-4 w-4 text-blue-500' />,
      trend: 'up',
      color: 'border-l-4 border-l-blue-500',
    },
    {
      title: 'Đơn hàng mới',
      value: '156',
      description: '+8% so với hôm qua',
      icon: <ShoppingCart className='h-4 w-4 text-orange-500' />,
      trend: 'up',
      color: 'border-l-4 border-l-orange-500',
    },
    {
      title: 'Khách hàng mới',
      value: '42',
      description: '-3% so với tuần trước',
      icon: <UsersIcon className='h-4 w-4 text-green-500' />,
      trend: 'down',
      color: 'border-l-4 border-l-green-500',
    },
    {
      title: 'Sản phẩm sắp hết',
      value: '12',
      description: 'Cần nhập thêm hàng',
      icon: <Package className='h-4 w-4 text-purple-500' />,
      trend: 'neutral',
      color: 'border-l-4 border-l-purple-500',
    },
  ];

  const recentOrders: RecentOrder[] = [
    {
      id: '#ORD-7281',
      customer: 'Nguyễn Văn A',
      amount: '1,250,000 đ',
      status: 'Completed',
      date: '14:30',
    },
    {
      id: '#ORD-7282',
      customer: 'Trần Thị B',
      amount: '850,000 đ',
      status: 'Pending',
      date: '15:45',
    },
    {
      id: '#ORD-7283',
      customer: 'Lê Văn C',
      amount: '2,100,000 đ',
      status: 'Processing',
      date: '16:20',
    },
    {
      id: '#ORD-7284',
      customer: 'Phạm Thị D',
      amount: '450,000 đ',
      status: 'Completed',
      date: '17:05',
    },
    {
      id: '#ORD-7285',
      customer: 'Hoàng Văn E',
      amount: '1,780,000 đ',
      status: 'Cancelled',
      date: '18:00',
    },
  ];

  const topProducts: TopProduct[] = [
    {
      name: 'iPhone 15 Pro Max',
      sales: 145,
      revenue: '4.35B đ',
      initials: 'IP',
    },
    { name: 'MacBook Pro M3', sales: 82, revenue: '3.69B đ', initials: 'MB' },
    { name: 'AirPods Pro 2', sales: 312, revenue: '1.87B đ', initials: 'AP' },
  ];

  return <DashboardView stats={stats} recentOrders={recentOrders} topProducts={topProducts} />;
}
