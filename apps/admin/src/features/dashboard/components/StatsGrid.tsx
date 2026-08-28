'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/common';
import { DashboardStat } from '@/features/dashboard/types/dashboard.interface';

interface StatsGridProps {
  stats: DashboardStat[];
}

function TrendBadge({ trend, description }: { trend?: DashboardStat['trend']; description?: string }) {
  if (!trend && !description) return null;

  const config = {
    up: { icon: ArrowUpRight, label: 'Tăng', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    down: { icon: ArrowDownRight, label: 'Giảm', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' },
    neutral: { icon: Minus, label: 'Ổn định', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const { icon: Icon, label, badgeClass } = config[trend ?? 'neutral'];

  return (
    <div className="flex items-center gap-2 mt-3">
      <Badge className={`text-[10px] font-bold py-0.5 px-2 flex items-center gap-0.5 border-none shadow-none ${badgeClass}`}>
        <Icon size={12} />
        {label}
      </Badge>
      {description && <p className="text-xs text-slate-500 font-medium truncate">{description}</p>}
    </div>
  );
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const iconBgMap: Record<number, string> = {
    0: 'bg-blue-50 text-blue-600 border-blue-100',
    1: 'bg-amber-50 text-amber-600 border-amber-100',
    2: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    3: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border border-slate-200/80 bg-white shadow-2xs rounded-2xl hover:border-slate-300 hover:shadow-md transition-all group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${iconBgMap[i % 4]}`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{stat.value}</div>
            <TrendBadge trend={stat.trend} description={stat.description} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
