'use client';

import React from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, type ColumnDef, Badge } from '@/components/common';
import { RecentOrder } from '@/features/dashboard/types/dashboard.interface';

interface RecentOrdersCardProps {
  recentOrders: RecentOrder[];
}

const orderColumns: ColumnDef<RecentOrder>[] = [
  {
    header: 'Mã đơn hàng',
    accessorKey: 'id',
    className: 'text-sm font-bold text-primary',
  },
  {
    header: 'Khách hàng',
    accessorKey: 'customer',
    className: 'text-sm',
  },
  {
    header: 'Tổng tiền',
    accessorKey: 'amount',
    className: 'text-sm font-semibold',
  },
  {
    header: 'Trạng thái',
    cell: (order) => (
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
    ),
  },
];

export default function RecentOrdersCard({ recentOrders }: RecentOrdersCardProps) {
  return (
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
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          tableClassName='min-w-full'
        />
      </CardContent>
    </Card>
  );
}
