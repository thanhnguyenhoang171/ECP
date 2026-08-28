'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/common';
import RevenueChart from './RevenueChart';
import { cn } from '@/lib/utils';

export default function RevenueChartCard() {
  const [period, setPeriod] = useState<'12m' | '30d' | '7d'>('12m');

  return (
    <Card className="lg:col-span-4 border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0 overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold text-slate-900">Biểu đồ Doanh thu & Lợi nhuận</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 border-none text-[10px] font-bold px-2 py-0.5">
                +24% so với kỳ trước
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Theo dõi biến động dòng tiền và biên lợi nhuận thực tế theo thời gian.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
            {(['12m', '30d', '7d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  period === p
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {p === '12m' ? '12 tháng' : p === '30d' ? '30 ngày' : '7 ngày'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <RevenueChart />
      </CardContent>
    </Card>
  );
}
