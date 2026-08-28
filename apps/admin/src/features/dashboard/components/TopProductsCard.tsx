'use client';

import React from 'react';
import { ChevronRight, Trophy, Flame } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TopProduct } from '@/features/dashboard/types/dashboard.interface';

interface TopProductsCardProps {
  topProducts: TopProduct[];
}

export default function TopProductsCard({ topProducts }: TopProductsCardProps) {
  const rankBadges = [
    { label: '#1', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    { label: '#2', bg: 'bg-slate-200 text-slate-800 border-slate-300' },
    { label: '#3', bg: 'bg-amber-800/10 text-amber-900 border-amber-800/20' },
  ];

  return (
    <Card className="lg:col-span-3 border border-slate-200/80 bg-white shadow-2xs rounded-2xl space-y-0 overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold text-slate-900">Sản phẩm bán chạy</CardTitle>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            </div>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Top 3 sản phẩm đạt doanh số cao nhất tháng này
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {topProducts.map((product, i) => {
            const badge = rankBadges[i] || { label: `#${i + 1}`, bg: 'bg-slate-100 text-slate-700' };
            const progress = Math.min(100, Math.round((product.sales / 350) * 100));

            return (
              <div key={i} className="flex flex-col gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`w-6 h-6 rounded-full flex items-center justify-center p-0 text-[10px] font-extrabold shadow-none ${badge.bg}`}>
                      {badge.label}
                    </Badge>
                    <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
                      <AvatarFallback className="bg-blue-50 text-blue-700 font-extrabold text-xs">
                        {product.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {product.sales} đơn đã bán
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-blue-600 block">
                      {product.revenue}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/products" className="block w-full mt-4">
          <Button
            variant="outline"
            className="w-full text-xs font-bold gap-2 h-9 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 border-slate-200 transition-colors">
            Xem tất cả sản phẩm <ChevronRight size={14} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
