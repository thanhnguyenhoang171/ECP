'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/common';
import { Package } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Breadcrumbs Skeleton */}
      <Breadcrumbs items={[{ label: 'Sản phẩm', href: '/products', icon: Package }, { label: 'Chi tiết sản phẩm' }]} />

      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* 2-Column Shopify Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: General Info */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <Skeleton className="h-6 w-56 rounded-md border-b border-slate-100 pb-3" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Physical Specs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <Skeleton className="h-6 w-60 rounded-md border-b border-slate-100 pb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          {/* Card 3: SKU Matrix Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-lg" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
