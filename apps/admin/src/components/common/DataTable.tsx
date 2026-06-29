'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  EmptyState,
} from '@/components/common';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface ColumnDef<T> {
  id?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    iconColor?: string;
  };
  rowKey?: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  loadingRows = 5,
  emptyState,
  rowKey = (item: any) => item.id || item.uuid,
  onRowClick,
  className,
  tableClassName,
  headerClassName,
}: DataTableProps<T>) {
  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (!isLoading && data.length === 0) {
    return (
      <div className='py-20'>
        <EmptyState
          title={emptyState?.title || 'Không có dữ liệu'}
          description={emptyState?.description || 'Hiện không có dữ liệu nào để hiển thị.'}
          icon={emptyState?.icon}
          iconColor={emptyState?.iconColor}
        />
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table className={tableClassName}>
        <TableHeader className={cn('bg-slate-50/50', headerClassName)}>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  'text-[11px] font-bold uppercase py-4 text-slate-500 whitespace-nowrap',
                  getAlignmentClass(column.align),
                  column.headerClassName,
                  index === 0 && 'pl-6',
                  index === columns.length - 1 && 'pr-6'
                )}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell 
                      key={j} 
                      className={cn(
                        'py-4', 
                        getAlignmentClass(column.align),
                        column.className,
                        j === 0 && 'pl-6', 
                        j === columns.length - 1 && 'pr-6'
                      )}
                    >
                      {column.skeleton || <Skeleton className='h-4 w-full' />}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((item, index) => (
                <TableRow
                  key={rowKey(item) || index}
                  className={cn(
                    'hover:bg-slate-200 transition-colors border-b border-slate-50 even:bg-slate-100/40',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}>
                  {columns.map((column, j) => (
                    <TableCell
                      key={j}
                      className={cn(
                        'py-4 whitespace-nowrap',
                        getAlignmentClass(column.align),
                        column.className,
                        j === 0 && 'pl-6',
                        j === columns.length - 1 && 'pr-6'
                      )}>
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey
                        ? (item[column.accessorKey] as React.ReactNode)
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
