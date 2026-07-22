'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, Edit2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

export interface DetailItem {
  label: string;
  value?: React.ReactNode;
  icon?: LucideIcon;
  colSpan?: number;
  fontMono?: boolean;
}

export interface DetailSection {
  title: string;
  cols?: number;
  items: DetailItem[];
}

export interface DetailDialogHeaderProps {
  icon?: LucideIcon;
  title?: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  header?: DetailDialogHeaderProps;
  sections?: DetailSection[];
  onEdit?: () => void;
  editLabel?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  maxWidthClass?: string;
}

export const DetailDialog = ({
  open,
  onOpenChange,
  isLoading = false,
  isError = false,
  errorMessage = 'Không thể tải thông tin dữ liệu từ máy chủ.',
  header,
  sections = [],
  onEdit,
  editLabel = 'Chỉnh sửa thông tin',
  createdAt,
  updatedAt,
  maxWidthClass = 'sm:max-w-3xl',
}: DetailDialogProps) => {
  const HeaderIcon = header?.icon;
  const hasFooterContent = !isLoading && !isError && (onEdit || createdAt || updatedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidthClass, "p-0 overflow-hidden border border-slate-200/80 shadow-2xl rounded-2xl")}>
        {/* Header Gradient Nhẹ Nhàng */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 p-6 border-b border-slate-100">
          <DialogHeader className="pr-8 space-y-0">
            <div className="flex items-center gap-4">
              {HeaderIcon && (
                <div className="p-3.5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 text-blue-600 shrink-0">
                  <HeaderIcon className="h-7 w-7" />
                </div>
              )}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                    {isLoading 
                      ? 'Đang tải thông tin...' 
                      : (header?.title || 'Thông tin chi tiết')}
                  </DialogTitle>
                  {!isLoading && header?.badge && (
                    <div className="shrink-0">
                      {header.badge}
                    </div>
                  )}
                </div>
                {header?.subtitle && (
                  <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500">
                    {header.subtitle}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Thân Modal Tối Giản */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-44 rounded-2xl" />
              </div>
            </div>
          ) : isError ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">{errorMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section, sIndex) => {
                const sectionCols = section.cols || 1;
                return (
                  <div 
                    key={sIndex} 
                    className={cn(
                      "space-y-3",
                      sectionCols > 1 ? "md:col-span-2" : "col-span-1"
                    )}
                  >
                    {/* Tiêu đề Section */}
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
                      <h4 className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                        {section.title}
                      </h4>
                    </div>

                    {/* Danh sách thông tin tối giản - Không lồng Card con */}
                    <div className={cn(
                      "p-4.5 rounded-2xl bg-slate-50/60 border border-slate-200/60 gap-y-4 gap-x-6 grid",
                      sectionCols >= 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : sectionCols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                    )}>
                      {section.items.map((item, iIndex) => {
                        const ItemIcon = item.icon;
                        const colSpan = item.colSpan || 1;
                        return (
                          <div 
                            key={iIndex} 
                            className={cn(
                              "space-y-1",
                              colSpan >= 3 ? "sm:col-span-2 md:col-span-3" : colSpan === 2 ? "sm:col-span-2" : ""
                            )}
                          >
                            <div className="flex items-center gap-1.5 text-slate-400">
                              {ItemIcon && <ItemIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">{item.label}</span>
                            </div>
                            <div className={cn(
                              "text-xs sm:text-sm font-semibold text-slate-800 break-words leading-relaxed pl-0.5",
                              item.fontMono && "font-mono text-slate-900"
                            )}>
                              {item.value !== undefined && item.value !== null && item.value !== '' 
                                ? item.value 
                                : <span className="text-slate-400 font-normal italic text-xs">Chưa có thông tin</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer với Timestamps nhỏ nhắn ở phía dưới */}
        {hasFooterContent && (
          <DialogFooter className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              {createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ngày tạo: <strong className="font-semibold text-slate-600">{formatDate(createdAt)}</strong></span>
                </span>
              )}
              {updatedAt && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cập nhật lần cuối: <strong className="font-semibold text-slate-600">{formatDate(updatedAt)}</strong></span>
                </span>
              )}
            </div>

            {onEdit && (
              <Button 
                size="sm" 
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs transition-all flex items-center gap-2 ml-auto"
                onClick={() => {
                  onOpenChange(false);
                  onEdit();
                }}
              >
                <Edit2 className="w-3.5 h-3.5" /> {editLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
