'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    <Card className={cn("shadow-sm border-slate-100", color, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-1.5 bg-muted/50 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
            {trend === 'up' && <ArrowUpRight size={10} className="text-green-500" />}
            {trend === 'down' && <ArrowDownRight size={10} className="text-red-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
