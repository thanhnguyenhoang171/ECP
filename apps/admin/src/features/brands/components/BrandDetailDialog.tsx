'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { DetailDialog, DetailSection } from '@/components/common';
import { Brand } from '../types/brand.interface';
import { 
  Tag, 
  FileText, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Hash 
} from 'lucide-react';

interface BrandDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
}

export function BrandDetailDialog({
  isOpen,
  onOpenChange,
  brand,
}: BrandDetailDialogProps) {
  if (!brand) return null;

  const sections: DetailSection[] = [
    {
      title: 'Thông tin cơ bản',
      cols: 2,
      items: [
        { label: 'Tên thương hiệu', value: brand.name, icon: Tag },
        { label: 'Đường dẫn (Slug)', value: brand.slug, icon: FileText, fontMono: true },
        { 
          label: 'Website chính thức', 
          value: brand.website ? (
            <a 
              href={brand.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-xs"
            >
              <Globe size={14} /> {brand.website}
            </a>
          ) : 'Không có website', 
          icon: Globe 
        },
        { label: 'ID Thương hiệu', value: brand.id, icon: Hash, fontMono: true },
      ],
    },
    {
      title: 'Mô tả & Logo',
      cols: 2,
      items: [
        { 
          label: 'Mô tả thương hiệu', 
          value: brand.description || 'Không có mô tả',
          colSpan: brand.logo ? 1 : 2,
        },
        ...(brand.logo ? [{
          label: 'Logo thương hiệu',
          value: (
            <div className="relative w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 mt-1 p-2 flex items-center justify-center">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          ),
        }] : []),
      ],
    },
  ];

  return (
    <DetailDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      createdAt={brand.createdAt}
      updatedAt={brand.updatedAt}
      header={{
        icon: Tag,
        title: brand.name,
        subtitle: `Slug: ${brand.slug}`,
        badge: (
          <Badge 
            className={
              brand.active 
                ? 'bg-emerald-100 text-emerald-700 border-none shrink-0 px-3 py-1 text-xs font-semibold' 
                : 'bg-rose-100 text-rose-700 border-none shrink-0 px-3 py-1 text-xs font-semibold'
            }
          >
            {brand.active ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Đã khóa
              </span>
            )}
          </Badge>
        ),
      }}
      sections={sections}
    />
  );
}
