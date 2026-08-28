'use client';

import React from 'react';
import { LayoutDashboard, RefreshCcw } from 'lucide-react';
import {
  Breadcrumbs,
  PageHeader,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Tổng quan', icon: LayoutDashboard }]} />

      {/* Page Header */}
      <PageHeader
        title="Tổng quan"
        description="Chào mừng bạn quay trở lại! Dưới đây là tình hình kinh doanh hôm nay."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-2" disabled>
              <RefreshCcw size={14} />
              Làm mới
            </Button>
            <Badge variant="secondary" className="h-9 px-4 text-sm font-medium">
              Hôm nay
            </Badge>
          </>
        }
      />

      {/* 4 Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-slate-200/80 bg-white shadow-2xs rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-7 w-32 rounded-md" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart & Top Products Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Card Skeleton (4 cols) */}
        <Card className="lg:col-span-4 border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3.5 w-64 rounded-md" />
              </div>
              <Skeleton className="h-7 w-36 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Top Products Card Skeleton (3 cols) */}
        <Card className="lg:col-span-3 border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-52 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
            <Skeleton className="h-9 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0">
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3.5 w-48 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[20%] min-w-[120px]">Mã đơn hàng</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[30%] min-w-[160px]">Khách hàng</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[20%] min-w-[110px]">Thời gian</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[15%] min-w-[120px]">Tổng tiền</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[15%] min-w-[110px]">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    <TableCell className="pl-6 py-4 w-[20%] min-w-[120px]">
                      <Skeleton className="h-4 w-20 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 w-[30%] min-w-[160px]">
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 w-[20%] min-w-[110px]">
                      <Skeleton className="h-4 w-16 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 w-[15%] min-w-[120px]">
                      <Skeleton className="h-4 w-24 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-center w-[15%] min-w-[110px]">
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
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
