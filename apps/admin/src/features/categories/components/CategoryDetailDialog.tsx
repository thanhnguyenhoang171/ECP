'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Category } from '../types/category.interface';
import { formatDate } from '@/lib/formatters';

interface CategoryDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  parentCategories: Category[];
}

export function CategoryDetailDialog({
  isOpen,
  onOpenChange,
  category,
  parentCategories,
}: CategoryDetailDialogProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-slate-900'>
            Chi tiết danh mục
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          {/* Thông tin cơ bản */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  Tên danh mục
                </h3>
                <p className='text-lg font-semibold text-slate-900'>
                  {category.name}
                </p>
              </div>

              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  Đường dẫn (Slug)
                </h3>
                <p className='text-sm font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200'>
                  {category.slug}
                </p>
              </div>

              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  Mô tả
                </h3>
                <p className='text-sm text-slate-600 leading-relaxed'>
                  {category.description || 'Không có mô tả'}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                    Cấp độ
                  </h3>
                  <div className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700'>
                    Cấp {category.level}
                  </div>
                </div>
                <div>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                    Thứ tự
                  </h3>
                  <p className='text-sm font-semibold text-slate-900'>
                    {category.order ?? 0}
                  </p>
                </div>
              </div>

              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  Danh mục cha
                </h3>
                <p className='text-sm text-slate-600'>
                  {parentCategories.find(c => c.id === category.parentId)?.name || 'Không có (Danh mục gốc)'}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  Trạng thái
                </h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  category.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {category.active ? 'Hoạt động' : 'Đã ẩn'}
                </div>
              </div>

              {category.imageUrl && (
                <div>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                    Hình ảnh
                  </h3>
                  <div className='relative w-32 h-32 rounded-lg border border-slate-200 overflow-hidden bg-slate-50'>
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                  ID
                </h3>
                <p className='text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all'>
                  {category.id}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          {(category.metaTitle || category.metaDescription || category.metaKeywords) && (
            <div className='border-t border-slate-200 pt-6'>
              <h3 className='text-sm font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                SEO (Search Engine Optimization)
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {category.metaTitle && (
                  <div>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Meta Title
                    </h4>
                    <p className='text-sm text-slate-700'>{category.metaTitle}</p>
                  </div>
                )}
                {category.metaDescription && (
                  <div>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Meta Description
                    </h4>
                    <p className='text-sm text-slate-700'>{category.metaDescription}</p>
                  </div>
                )}
                {category.metaKeywords && (
                  <div>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Meta Keywords
                    </h4>
                    <p className='text-sm text-slate-700'>{category.metaKeywords}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className='border-t border-slate-200 pt-4'>
            <div className='grid grid-cols-2 gap-4 text-xs text-slate-500'>
              <div>
                <span className='font-semibold'>Ngày tạo:</span>{' '}
                {formatDate(category.createdAt)}
              </div>
              <div>
                <span className='font-semibold'>Ngày cập nhật:</span>{' '}
                {formatDate(category.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
