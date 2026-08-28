'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DataTable, type ColumnDef, Badge } from '@/components/common';
import { RecentOrder } from '@/features/dashboard/types/dashboard.interface';
import { cn } from '@/lib/utils';

interface RecentOrdersCardProps {
  recentOrders: RecentOrder[];
}

const orderColumns: ColumnDef<RecentOrder>[] = [
  {
    header: 'Mã đơn hàng',
    accessorKey: 'id',
    className: 'w-[20%] min-w-[120px]',
    headerClassName: 'w-[20%] min-w-[120px]',
    cell: (order) => (
      <span className="font-mono text-xs font-bold text-blue-600 hover:underline cursor-pointer">
        {order.id}
      </span>
    ),
  },
  {
    header: 'Khách hàng',
    accessorKey: 'customer',
    className: 'w-[30%] min-w-[160px]',
    headerClassName: 'w-[30%] min-w-[160px]',
    cell: (order) => (
      <span className="text-xs font-semibold text-slate-800">{order.customer}</span>
    ),
  },
  {
    header: 'Thời gian',
    accessorKey: 'date',
    className: 'w-[20%] min-w-[110px]',
    headerClassName: 'w-[20%] min-w-[110px]',
    cell: (order) => (
      <span className="text-xs text-slate-500 font-mono">{order.date || 'Gần đây'}</span>
    ),
  },
  {
    header: 'Tổng tiền',
    accessorKey: 'amount',
    className: 'w-[15%] min-w-[120px]',
    headerClassName: 'w-[15%] min-w-[120px]',
    cell: (order) => (
      <span className="text-xs font-mono font-bold text-slate-900">{order.amount}</span>
    ),
  },
  {
    header: 'Trạng thái',
    align: 'center',
    className: 'w-[15%] min-w-[110px]',
    headerClassName: 'w-[15%] min-w-[110px]',
    cell: (order) => {
      const isCompleted = order.status === 'Completed';
      const isPending = order.status === 'Pending';
      const isProcessing = order.status === 'Processing';

      return (
        <Badge
          className={cn(
            'px-2.5 py-0.5 text-[10px] font-extrabold uppercase border-none shadow-none',
            isCompleted && 'bg-emerald-100 text-emerald-800',
            isProcessing && 'bg-blue-100 text-blue-800',
            isPending && 'bg-amber-100 text-amber-800',
            !isCompleted && !isPending && !isProcessing && 'bg-rose-100 text-rose-800'
          )}
        >
          {isCompleted ? 'Hoàn thành' : isProcessing ? 'Đang xử lý' : isPending ? 'Chờ xử lý' : 'Đã hủy'}
        </Badge>
      );
    },
  },
];

export default function RecentOrdersCard({ recentOrders }: RecentOrdersCardProps) {
  return (
    <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900">Đơn hàng gần đây</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
            Cập nhật giao dịch thời gian thực từ hệ thống
          </CardDescription>
        </div>
        <Link href="/orders">
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-slate-200">
            Xem tất cả
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          tableClassName="min-w-full"
        />
      </CardContent>
    </Card>
  );
}
