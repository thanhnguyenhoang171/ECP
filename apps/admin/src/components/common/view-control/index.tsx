'use client';

import React from 'react';
import { Search, Loader2, Download, Filter, ArrowUpDown, Plus, Upload, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// 1. Search Input
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const SearchInput = ({ value, onChange, placeholder, isLoading }: SearchInputProps) => {
  return (
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 font-bold" />
      <Input
        placeholder={placeholder || 'Tìm kiếm...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-10 text-sm font-semibold border-slate-300 focus-visible:ring-blue-600 bg-white rounded-xl shadow-2xs"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
      )}
    </div>
  );
};

// 2. Action Buttons (Header)
export const ImportButton = ({ onClick, label = 'Nhập file', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) => (
  <Button variant="outline" size="sm" className="h-9 font-extrabold text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100 rounded-xl shadow-2xs" onClick={onClick} disabled={disabled}>
    <Upload className="mr-1.5 h-3.5 w-3.5" />
    {label}
  </Button>
);

export const ExportButton = ({ onExport, isLoading, label = 'Xuất file', disabled }: { onExport: () => void; isLoading: boolean; label?: string; disabled?: boolean }) => (
  <Button variant="outline" size="sm" className="h-9 font-extrabold text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100 rounded-xl shadow-2xs" onClick={onExport} disabled={isLoading || disabled}>
    {isLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
    {isLoading ? 'Đang xuất...' : label}
  </Button>
);

export const AddNewButton = ({ onClick, label = 'Thêm mới', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) => (
  <Button size="sm" variant="default" onClick={onClick} className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm rounded-xl px-4" disabled={disabled}>
    <Plus className="mr-1.5 h-4 w-4 stroke-[3]" /> {label} 
  </Button>
);

export const ResetFiltersButton = ({ onClick, label = 'Đặt lại bộ lọc', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) => (
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={onClick} 
    disabled={disabled}
    className="h-10 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50/50 hover:bg-orange-100/60 border border-orange-200 rounded-xl transition-colors"
  >
    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
    {label}
  </Button>
);

// 3. Popover Controls
export const FilterPopover = ({ children, activeCount, onClear, disabled, onOpenChange }: { children: React.ReactNode; activeCount?: number; onClear?: () => void; disabled?: boolean; onOpenChange?: (open: boolean) => void }) => {
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant={activeCount ? 'default' : 'outline'} className="h-10 text-xs font-bold border-slate-300 rounded-xl" disabled={disabled}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Lọc {activeCount ? `(${activeCount})` : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4 rounded-2xl border-slate-300 shadow-xl">
        <div className="space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">Bộ lọc</h4>
          {children}
          {activeCount ? (
            <Button variant="ghost" size="sm" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs mt-2 font-bold" onClick={onClear}>
              Xóa tất cả bộ lọc
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const SortPopover = ({ options, currentValue, onSelect, disabled }: { options: { label: string; value: string }[]; currentValue: string; onSelect: (value: string) => void; disabled?: boolean }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 text-xs font-bold border-slate-300 rounded-xl" disabled={disabled}>
          <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
          Sắp xếp
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2 rounded-2xl border-slate-300 shadow-xl">
        <div className="flex flex-col gap-1">
          {options.map((option) => (
            <Button key={option.value} variant={currentValue === option.value ? 'secondary' : 'ghost'} size="sm" className="justify-start font-bold text-xs rounded-lg" onClick={() => onSelect(option.value)} disabled={disabled}>
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// 4. Row Actions (Table)
export const EditActionButton = ({ onClick, disabled }: { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-100/70 rounded-lg transition-transform hover:scale-105"
          disabled={disabled}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Chỉnh sửa</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const DeleteActionButton = ({ onClick, disabled }: { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-100/70 rounded-lg transition-transform hover:scale-105"
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-rose-600 text-white font-bold text-xs">Xoá</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ViewActionButton = ({ onClick, disabled }: { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-100/70 rounded-lg transition-transform hover:scale-105"
          disabled={disabled}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="bg-slate-900 text-white font-bold text-xs">Xem chi tiết</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// 5. Shared Dialogs
export const DeleteConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận xóa', 
  description = 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
  isLoading = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title?: string; 
  description?: string;
  isLoading?: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className='sm:max-w-100'>
      <DialogHeader>
        <DialogTitle className='text-destructive flex items-center gap-2'>
          <Trash2 className='h-5 w-5' /> {title}
        </DialogTitle>
        <DialogDescription className='py-4'>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter className='gap-2 sm:gap-0'>
        <Button variant='outline' onClick={onClose} disabled={isLoading}>Hủy</Button>
        <Button variant='destructive' onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} Xác nhận xóa
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
