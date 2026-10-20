'use client';

import React from 'react';
import { Package } from 'lucide-react';

import { Breadcrumbs } from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductEditorLoading = (): React.JSX.Element => (
  <div className='space-y-6' role='status' aria-label='Đang tải thông tin sản phẩm'>
    <Breadcrumbs items={[
      { label: 'Sản phẩm', href: '/products', icon: Package },
      { label: 'Đang tải...' },
    ]} />
    <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-80 max-w-full' />
      </div>
      <Skeleton className='h-10 w-40' />
    </div>
    <Skeleton className='h-12 w-full rounded-xl' />
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
      <div className='space-y-6 lg:col-span-8'>
        <Skeleton className='h-80 w-full rounded-2xl' />
        <Skeleton className='h-56 w-full rounded-2xl' />
      </div>
      <div className='space-y-6 lg:col-span-4'>
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
      </div>
    </div>
  </div>
);
