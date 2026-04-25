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
        title="Bảng điều khiển"
        description="Chào mừng trở lại! Đây là tóm tắt hoạt động của cửa hàng hôm nay."
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
        <Card className='lg:col-span-4 shadow-sm border-slate-100'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg'>Biểu đồ doanh thu</CardTitle>
                <CardDescription className='text-xs'>
                  Tăng trưởng 24% so với tuần trước
                </CardDescription>
              </div>
              <TrendingUp className='text-primary h-5 w-5 opacity-50' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-[250px] w-full bg-slate-50/50 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground'>
              <TrendingUp size={40} className='mb-2 opacity-10' />
              <p className='text-xs font-medium'>Đang tối ưu hóa biểu đồ...</p>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-3 shadow-sm border-slate-100'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Sản phẩm bán chạy</CardTitle>
            <CardDescription className='text-xs'>
              Top 3 trong tháng này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {topProducts.map((product, i) => (
                <div key={i} className='flex items-center'>
                  <Avatar className='h-8 w-8 border border-slate-100'>
                    <AvatarFallback className='bg-primary/10 text-primary font-bold text-[10px]'>
                      {product.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='ml-3 space-y-0.5'>
                    <p className='text-xs font-bold leading-none'>
                      {product.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {product.sales} lượt bán
                    </p>
                  </div>
                  <div className='ml-auto font-bold text-xs text-green-600'>
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant='ghost'
              className='w-full mt-6 text-[10px] uppercase tracking-widest font-bold text-primary gap-2 h-8'>
              Tất cả sản phẩm <ChevronRight size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className='shadow-sm border-slate-100 overflow-hidden'>
        <CardHeader className='flex flex-row items-center justify-between pb-2 bg-slate-50/30'>
          <div>
            <CardTitle className='text-lg'>Đơn hàng gần đây</CardTitle>
            <CardDescription className='text-xs'>
              Cập nhật 2 phút trước
            </CardDescription>
          </div>
          <Button variant='outline' size='sm' className='h-8 text-xs'>
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-slate-50/50'>
                <TableRow>
                  <TableHead className='text-[10px] font-bold uppercase py-3'>
                    Mã đơn
                  </TableHead>
                  <TableHead className='text-[10px] font-bold uppercase py-3'>
                    Khách hàng
                  </TableHead>
                  <TableHead className='text-[10px] font-bold uppercase py-3'>
                    Số tiền
                  </TableHead>
                  <TableHead className='text-[10px] font-bold uppercase py-3'>
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className='hover:bg-slate-50/50 transition-colors'>
                    <TableCell className='text-xs font-bold text-primary py-3 px-4'>
                      {order.id}
                    </TableCell>
                    <TableCell className='text-xs py-3'>
                      {order.customer}
                    </TableCell>
                    <TableCell className='text-xs font-medium py-3'>
                      {order.amount}
                    </TableCell>
                    <TableCell className='py-3'>
                      <Badge
                        className='text-[9px] h-5 px-2'
                        variant={
                          order.status === 'Completed'
                            ? 'default'
                            : order.status === 'Pending'
                              ? 'outline'
                              : 'secondary'
                        }>
                        {order.status}
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
