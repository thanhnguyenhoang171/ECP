'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from './index';
import { cn } from '@/lib/utils';

interface DataCardProps {
  /**
   * Component for searching (usually SearchInput)
   */
  search?: React.ReactNode;
  /**
   * Extra actions on the right side of the header (filters, sort, etc.)
   */
  extra?: React.ReactNode;
  /**
   * The main content (usually DataTable)
   */
  children: React.ReactNode;
  /**
   * Footer content (usually Pagination)
   */
  footer?: React.ReactNode;
  /**
   * Loading state for the whole card
   */
  isLoading?: boolean;
  /**
   * Fetching state (shows an overlay if true and isLoading is false)
   */
  isFetching?: boolean;
  /**
   * Custom class name for the Card
   */
  className?: string;
  /**
   * Custom class name for the CardHeader
   */
  headerClassName?: string;
  /**
   * Custom class name for the CardContent
   */
  contentClassName?: string;
}

export function DataCard({
  search,
  extra,
  children,
  footer,
  isLoading,
  isFetching,
  className,
  headerClassName,
  contentClassName,
}: DataCardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Control Bar: Search & Filter Card */}
      {(search || extra) && (
        <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/95 p-4 rounded-2xl border border-slate-300/80 shadow-md', headerClassName)}>
          <div className="flex-1 max-w-md">
            {search}
          </div>
          {extra && <div className='flex items-center gap-2 flex-wrap'>{extra}</div>}
        </div>
      )}

      {/* 2. Main Content / Table Card */}
      <Card className={cn('overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all', className)}>
        <CardContent className={cn('p-0 relative', contentClassName)}>
          {children}
        </CardContent>
      </Card>

      {/* 3. Pagination Card */}
      {footer}
    </div>
  );
}
