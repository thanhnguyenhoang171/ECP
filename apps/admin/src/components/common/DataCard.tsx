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
    <Card className={cn('overflow-hidden shadow-main border-border', className)}>
      {(search || extra) && (
        <CardHeader className={cn('pb-4 bg-slate-50/30 border-b border-border', headerClassName)}>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className="flex-1 max-w-md">
              {search}
            </div>
            {extra && <div className='flex items-center gap-2'>{extra}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('p-0 relative', contentClassName)}>
        {isFetching && !isLoading && (
          <div className='absolute inset-0 bg-white/40 z-10 flex items-center justify-center backdrop-blur-[1px] transition-all' />
        )}
        {children}
        {footer && <div className='border-t border-border'>{footer}</div>}
      </CardContent>
    </Card>
  );
}
