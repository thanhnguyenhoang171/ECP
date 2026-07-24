import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-4 space-y-4 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-square w-full bg-zinc-100 rounded-lg"></div>

      {/* Content Lines Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-16 bg-zinc-100 rounded"></div>
        <div className="h-4 w-3/4 bg-zinc-200 rounded"></div>
        <div className="h-3 w-1/2 bg-zinc-100 rounded"></div>
      </div>

      {/* Price & Action Skeleton */}
      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
        <div className="h-5 w-24 bg-zinc-200 rounded"></div>
        <div className="h-8 w-8 bg-zinc-100 rounded-lg"></div>
      </div>
    </div>
  );
}
