'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
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
  isForbidden?: boolean;
  forbiddenState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
  };
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
  isForbidden,
  forbiddenState,
  emptyState,
  rowKey = (item: T) => ((item as Record<string, unknown>)?.id ?? (item as Record<string, unknown>)?.uuid ?? '') as string | number,
  onRowClick,
  className,
  tableClassName,
  headerClassName,
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

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

  if (isForbidden) {
    return (
      <div className="py-20">
        <EmptyState
          title={forbiddenState?.title || 'Không có quyền xem dữ liệu'}
          description={
            forbiddenState?.description ||
            'Tài khoản của bạn chưa được cấp quyền xem danh sách dữ liệu này. Vui lòng liên hệ Quản trị viên để được phân quyền.'
          }
          icon={forbiddenState?.icon || <ShieldAlert className="h-10 w-10 text-rose-500" />}
          iconColor="bg-rose-50 text-rose-500 dark:bg-rose-950/40"
          note={null}
        />
      </div>
    );
  }

  if (!isLoading && safeData.length === 0) {
    return (
      <div className="py-20">
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
        <TableHeader className={cn('bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700', headerClassName)}>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  'text-[11px] font-extrabold uppercase tracking-wider py-4 text-slate-700 dark:text-slate-200 whitespace-nowrap',
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
                <TableRow key={i} className="border-b border-slate-200/60 dark:border-slate-800">
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
                      {column.skeleton || (
                        <Skeleton className={cn(
                          'h-5 rounded-lg',
                          column.align === 'center' ? 'w-16 mx-auto' :
                          column.align === 'right' ? 'w-20 ml-auto' :
                          'w-28'
                        )} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : safeData.map((item, index) => (
                <TableRow
                  key={rowKey(item) || index}
                  className={cn(
                    'hover:bg-blue-50/50 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-200/80 dark:border-slate-800 even:bg-slate-50/40',
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
