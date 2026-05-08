'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  color,
  className
}: StatsCardProps) => {
  return (
    <Card className={cn("overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl", color || "bg-slate-100 text-slate-600")}>
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend === 'up' && (
              <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">
                <ArrowUpRight size={12} className="mr-0.5" />
                Tăng
              </div>
            )}
            {trend === 'down' && (
              <div className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                <ArrowDownRight size={12} className="mr-0.5" />
                Giảm
              </div>
            )}
            {trend === 'neutral' && (
              <div className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                <Minus size={12} className="mr-0.5" />
                Ổn định
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-medium">
              {description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
