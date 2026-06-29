'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TopProduct } from '@/features/dashboard/types/dashboard.interface';

interface TopProductsCardProps {
  topProducts: TopProduct[];
}

export default function TopProductsCard({ topProducts }: TopProductsCardProps) {
  return (
    <Card className='lg:col-span-3'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg'>Sản phẩm bán chạy</CardTitle>
        <CardDescription className='text-xs'>
          Top sản phẩm trong tháng này
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {topProducts.map((product, i) => (
            <div key={i} className='flex items-center'>
              <Avatar className='h-10 w-10 border border-slate-100'>
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                  {product.initials}
                </AvatarFallback>
              </Avatar>
              <div className='ml-3 space-y-0.5'>
                <p className='text-sm font-bold leading-none text-slate-900'>
                  {product.name}
                </p>
                <p className='text-xs text-slate-500'>
                  {product.sales} đơn hàng
                </p>
              </div>
              <div className='ml-auto font-bold text-sm text-slate-900'>
                {product.revenue}
              </div>
            </div>
          ))}
        </div>
        <Link href="/products" className="block w-full">
          <Button
            variant='ghost'
            className='w-full mt-6 text-xs font-bold gap-2 h-10 text-primary hover:bg-primary/5'>
            Xem tất cả sản phẩm <ChevronRight size={14} />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
