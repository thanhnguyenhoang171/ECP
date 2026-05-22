'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common';
import RevenueChart from './RevenueChart';

export default function RevenueChartCard() {
  return (
    <Card className='lg:col-span-4'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg'>Biểu đồ doanh thu</CardTitle>
            <CardDescription className='text-xs'>
              Tăng trưởng 24% so với tuần trước
            </CardDescription>
          </div>
          <TrendingUp className='h-5 w-5 text-primary opacity-50' />
        </div>
      </CardHeader>
      <CardContent>
        <RevenueChart />
      </CardContent>
    </Card>
  );
}
