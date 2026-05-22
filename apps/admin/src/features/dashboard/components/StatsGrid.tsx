'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import { DashboardStat } from '@/features/dashboard/types/dashboard.interface';

interface StatsGridProps {
  stats: DashboardStat[];
}

function TrendBadge({ trend, description }: { trend?: DashboardStat['trend']; description?: string }) {
  if (!trend && !description) return null;

  const config = {
    up: { icon: ArrowUpRight, label: 'Tăng', textColor: 'text-green-600', bgColor: 'bg-green-50' },
    down: { icon: ArrowDownRight, label: 'Giảm', textColor: 'text-red-600', bgColor: 'bg-red-50' },
    neutral: { icon: Minus, label: 'Ổn định', textColor: 'text-slate-400', bgColor: 'bg-slate-50' },
  };

  const { icon: Icon, label, textColor, bgColor } = config[trend ?? 'neutral'];

  return (
    <div className='flex items-center gap-1.5 mt-2'>
      <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${textColor} ${bgColor}`}>
        <Icon size={12} className='mr-0.5' />
        {label}
      </div>
      {description && <p className='text-[10px] text-slate-400 font-medium'>{description}</p>}
    </div>
  );
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              {stat.title}
            </CardTitle>
            <div className='p-2 rounded-xl bg-slate-100 text-slate-600'>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 18 })}
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black text-slate-900 tracking-tight'>{stat.value}</div>
            <TrendBadge trend={stat.trend} description={stat.description} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
