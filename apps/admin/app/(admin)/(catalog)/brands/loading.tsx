import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrandsLoading(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      {/* Page Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* DataCard skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        {/* Search & Filter toolbar skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
          <div className="h-11 bg-slate-50/70 border-b border-slate-100 flex items-center px-4 gap-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md ml-auto hidden md:block" />
            <Skeleton className="h-4 w-20 rounded-md ml-auto" />
            <Skeleton className="h-4 w-24 rounded-md ml-auto" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 border-b border-slate-50 flex items-center px-4 gap-4 last:border-b-0"
            >
              <div className="flex items-center gap-3 w-[35%] min-w-[220px]">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-4 w-40 rounded-md hidden md:block" />
              <Skeleton className="h-6 w-16 mx-auto rounded-full" />
              <div className="flex items-center justify-end gap-1 ml-auto">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
