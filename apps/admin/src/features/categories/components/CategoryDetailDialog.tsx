'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { DetailDialog, DetailSection } from '@/components/common';
import { Category } from '../types/category.interface';
import { 
  Layers, 
  Tag, 
  FolderTree, 
  FileText, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Hash, 
  ListOrdered 
} from 'lucide-react';

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

  const parentCategory = parentCategories.find(c => c.id === category.parentId);

  const sections: DetailSection[] = [
    {
      title: "Thông tin cơ bản",
      cols: 2,
      items: [
        { label: "Tên danh mục", value: category.name, icon: Tag },
        { label: "Đường dẫn (Slug)", value: category.slug, icon: FileText, fontMono: true },
        { label: "Cấp độ", value: `Cấp ${category.level}`, icon: FolderTree },
        { label: "Thứ tự hiển thị", value: category.order ?? 0, icon: ListOrdered },
        { 
          label: "Danh mục cha", 
          value: parentCategory ? parentCategory.name : 'Không có (Danh mục gốc)', 
          icon: Layers 
        },
        { label: "ID danh mục", value: category.id, icon: Hash, fontMono: true },
      ]
    },
    {
      title: "Mô tả & Hình ảnh",
      cols: 2,
      items: [
        { 
          label: "Mô tả", 
          value: category.description || 'Không có mô tả',
          colSpan: category.imageUrl ? 1 : 2
        },
        ...(category.imageUrl ? [{
          label: "Hình ảnh danh mục",
          value: (
            <div className="relative w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 mt-1">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )
        }] : [])
      ]
    },
  ];

  if (category.metaTitle || category.metaDescription || category.metaKeywords) {
    sections.push({
      title: "Cấu hình SEO",
      cols: 2,
      items: [
        { label: "Meta Title", value: category.metaTitle || 'N/A', icon: Globe },
        { label: "Meta Keywords", value: category.metaKeywords || 'N/A', icon: FileText },
        { label: "Meta Description", value: category.metaDescription || 'N/A', colSpan: 2 },
      ]
    });
  }

  return (
    <DetailDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      createdAt={category.createdAt}
      updatedAt={category.updatedAt}
      header={{
        icon: Layers,
        title: category.name,
        subtitle: `Slug: ${category.slug}`,
        badge: (
          <Badge 
            className={
              category.active 
                ? "bg-green-100 text-green-700 border-none shrink-0 px-3 py-1 text-xs font-semibold" 
                : "bg-red-100 text-red-700 border-none shrink-0 px-3 py-1 text-xs font-semibold"
            }
          >
            {category.active ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Đã ẩn
              </span>
            )}
          </Badge>
        )
      }}
      sections={sections}
    />
  );
}
