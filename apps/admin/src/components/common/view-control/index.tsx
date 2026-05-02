'use client';

import React from 'react';
import { Search, Loader2, Download, Filter, ArrowUpDown, Plus, Upload, Edit, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// 1. Search Input
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const SearchInput = ({ value, onChange, placeholder, isLoading }: SearchInputProps) => (
  <div className='relative w-full md:w-80'>
    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
    <Input
      placeholder={placeholder || 'Tìm kiếm...'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-blue-500'
    />
    {isLoading && (
      <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500' />
    )}
  </div>
);

// 2. Action Buttons (Header)
export const ImportButton = ({ onClick, label = 'Nhập file' }: { onClick: () => void; label?: string }) => (
  <Button variant='outline' size='sm' className='h-9' onClick={onClick}>
    <Download className='mr-2 h-4 w-4 text-slate-500' /> {label}
  </Button>
);

export const ExportButton = ({ onExport, isLoading, label = 'Xuất file' }: { onExport: () => void; isLoading: boolean; label?: string }) => (
  <Button variant='outline' size='sm' className='h-9' onClick={onExport} disabled={isLoading}>
    {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Upload className='mr-2 h-4 w-4 text-slate-500' />}
    {isLoading ? 'Đang xuất...' : label}
  </Button>
);

export const AddNewButton = ({ onClick, label = 'Thêm mới' }: { onClick: () => void; label?: string }) => (
  <Button size='sm' variant='default' onClick={onClick} className='h-9 shadow-md shadow-blue-100'>
    <Plus className='mr-2 h-4 w-4' /> {label}
  </Button>
);

// 3. Popover Controls
export const FilterPopover = ({ children, activeCount, onClear }: { children: React.ReactNode; activeCount?: number; onClear?: () => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant={activeCount ? 'default' : 'outline'} className='h-10 text-xs border-slate-200'>
        <Filter className='mr-2 h-4 w-4 text-slate-400' />
        Lọc {activeCount ? `(${activeCount})` : ''}
      </Button>
    </PopoverTrigger>
    <PopoverContent align='end' className='w-64 p-4'>
      <div className='space-y-4'>
        <h4 className='font-medium text-sm leading-none'>Bộ lọc</h4>
        {children}
        {activeCount ? (
          <Button variant='ghost' size='sm' className='w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs mt-2' onClick={onClear}>
            Xóa tất cả bộ lọc
          </Button>
        ) : null}
      </div>
    </PopoverContent>
  </Popover>
);

export const SortPopover = ({ options, currentValue, onSelect }: { options: { label: string; value: string }[]; currentValue: string; onSelect: (value: string) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant='outline' className='h-10 text-xs border-slate-200'>
        <ArrowUpDown className='mr-2 h-4 w-4 text-slate-400' /> Sắp xếp
      </Button>
    </PopoverTrigger>
    <PopoverContent align='end' className='w-48 p-2'>
      <div className='flex flex-col gap-1'>
        {options.map((option) => (
          <Button key={option.value} variant={currentValue === option.value ? 'secondary' : 'ghost'} size='sm' className='justify-start font-normal text-xs' onClick={() => onSelect(option.value)}>
            {option.label}
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

// 4. Row Actions (Table)
export const EditActionButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant='ghost' size='icon' onClick={onClick} className='h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50'>
    <Edit className='h-4 w-4' />
  </Button>
);

export const DeleteActionButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant='ghost' size='icon' onClick={onClick} className='h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50'>
    <Trash2 className='h-4 w-4' />
  </Button>
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
