'use client';

import React from 'react';
import {
  RefreshCcw,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

import { 
  Button, 
  Badge, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  PageHeader, 
  StatsCard,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardStat, RecentOrder, TopProduct } from '@/features/dashboard/types/dashboard.interface';

interface DashboardViewProps {
  stats: DashboardStat[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export default function DashboardView({ stats, recentOrders, topProducts }: DashboardViewProps) {
  return (
    <div className='space-y-6'>
      <PageHeader 
        title="Tổng quan"
        description="Chào mừng bạn quay trở lại! Dưới đây là tình hình kinh doanh hôm nay."
        actions={
          <>
            <Button variant='outline' size='sm' className='h-9 gap-2'>
              <RefreshCcw size={14} />
              Làm mới
            </Button>
            <Badge variant='secondary' className='h-9 px-4 text-sm font-medium'>
              Hôm nay
            </Badge>
          </>
        }
      />

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, i) => (
          <StatsCard 
            key={i}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='lg:col-span-4'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Biểu đồ doanh thu</CardTitle>
                <CardDescription className='text-xs'>
                  Tăng trưởng 24% so với tuần trước
                </CardDescription>
              </div>
              <TrendingUp className='h-5 w-5 text-primary opacity-50' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-[300px] w-full rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400'>
              <TrendingUp size={40} className='mb-2 opacity-20' />
              <p className='text-sm font-medium'>Đang tải dữ liệu biểu đồ...</p>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Sản phẩm bán chạy</CardTitle>
            <CardDescription className='text-xs'>
              Top sản phẩm trong tháng này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {topProducts.map((product, i) => (
                <div key={i} className='flex items-center'>
                  <Avatar className='h-10 w-10 border border-slate-100'>
                    <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                      {product.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='ml-3 space-y-0.5'>
                    <p className='text-sm font-bold leading-none text-slate-900'>
                      {product.name}
                    </p>
                    <p className='text-xs text-slate-500'>
                      {product.sales} đơn hàng
                    </p>
                  </div>
                  <div className='ml-auto font-bold text-sm text-slate-900'>
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant='ghost'
              className='w-full mt-6 text-xs font-bold gap-2 h-10 text-primary hover:bg-primary/5'>
              Xem tất cả sản phẩm <ChevronRight size={14} />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className='overflow-hidden'>
        <CardHeader className='flex flex-row items-center justify-between pb-4 bg-slate-50/50 border-b border-slate-100'>
          <div>
            <CardTitle className='text-lg'>Đơn hàng gần đây</CardTitle>
            <CardDescription className='text-xs'>
              Cập nhật 2 phút trước
            </CardDescription>
          </div>
          <Button variant='outline' size='sm' className='h-8 text-xs font-semibold'>
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className='text-xs font-bold uppercase py-4'>
                    Mã đơn hàng
                  </TableHead>
                  <TableHead className='text-xs font-bold uppercase py-4'>
                    Khách hàng
                  </TableHead>
                  <TableHead className='text-xs font-bold uppercase py-4'>
                    Tổng tiền
                  </TableHead>
                  <TableHead className='text-xs font-bold uppercase py-4'>
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className='hover:bg-slate-50/50 transition-colors'>
                    <TableCell className='text-sm font-bold py-4 px-6 text-primary'>
                      {order.id}
                    </TableCell>
                    <TableCell className='text-sm py-4'>
                      {order.customer}
                    </TableCell>
                    <TableCell className='text-sm font-semibold py-4'>
                      {order.amount}
                    </TableCell>
                    <TableCell className='py-4'>
                      <Badge
                        className='px-2.5 py-0.5 text-[10px] font-bold uppercase'
                        variant={
                          order.status === 'Completed'
                            ? 'default'
                            : order.status === 'Pending'
                              ? 'outline'
                              : 'secondary'
                        }>
                        {order.status === 'Completed' ? 'Hoàn thành' : order.status === 'Pending' ? 'Chờ xử lý' : 'Đã hủy'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
