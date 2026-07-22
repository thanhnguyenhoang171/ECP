'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { DetailDialog, DetailSection } from '@/components/common';
import { Product } from '../types/product.interface';
import { Category } from '@/features/categories/types/category.interface';
import { useProductDetail } from '../hooks/use-products';
import { 
  Package, 
  Tag, 
  FileText, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Hash, 
  Layers,
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';

interface ProductDetailDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
}

export default function ProductDetailDialog({
  productId,
  open,
  onOpenChange,
  categories = [],
}: ProductDetailDialogProps) {
  const activeId = open && productId ? productId : '';
  const { data: product, isFetching: isLoading, isError } = useProductDetail(activeId);

  const categoryName = categories.find(c => c.id === product?.categoryId)?.name || 'Chưa phân loại';
  const isPublished = product?.isPublished ?? (product as any)?.published ?? false;

  const thumbObj = product?.thumbnail as any;
  const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

  // Transform specs if present
  const specs = product?.specifications;
  const specItems = Array.isArray(specs) 
    ? specs 
    : typeof specs === 'object' && specs !== null 
      ? Object.entries(specs).map(([key, value]) => ({ key, value })) 
      : [];

  const sections: DetailSection[] = [
    {
      title: "Thông tin định danh",
      cols: 2,
      items: [
        { label: "Tên sản phẩm", value: product?.name, icon: ShoppingBag },
        { label: "Mã SKU chính", value: product?.sku, icon: Hash, fontMono: true },
        { label: "Thương hiệu", value: product?.brand || 'N/A', icon: Tag },
        { label: "Danh mục sản phẩm", value: categoryName, icon: Layers },
        { label: "Đường dẫn (Slug)", value: product?.slug, icon: Globe, fontMono: true },
        { label: "Mã ID sản phẩm", value: product?.id, icon: FileText, fontMono: true },
      ]
    },
  ];

  if (product?.description || thumbUrl) {
    sections.push({
      title: "Mô tả & Hình ảnh đại diện",
      cols: 2,
      items: [
        { 
          label: "Mô tả sản phẩm", 
          value: product?.description || 'Chưa có mô tả chi tiết',
          colSpan: thumbUrl ? 1 : 2
        },
        ...(thumbUrl ? [{
          label: "Hình ảnh đại diện (Thumbnail)",
          value: (
            <div className="relative w-28 h-28 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 mt-1">
              <Image
                src={thumbUrl}
                alt={product?.name || 'Product'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )
        }] : [])
      ]
    });
  }

  if (specItems.length > 0) {
    sections.push({
      title: "Thông số kỹ thuật",
      cols: 2,
      items: specItems.map(s => ({
        label: s.key,
        value: String(s.value),
        icon: SlidersHorizontal
      }))
    });
  }

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Không thể tải thông tin chi tiết sản phẩm từ máy chủ."
      createdAt={(product as any)?.createdAt}
      updatedAt={(product as any)?.updatedAt}
      header={{
        icon: Package,
        title: product?.name,
        subtitle: `SKU: ${product?.sku || 'N/A'} • Brand: ${product?.brand || 'N/A'}`,
        badge: product ? (
          <Badge 
            className={
              isPublished 
                ? "bg-emerald-100 text-emerald-700 border-none shrink-0 px-3 py-1 text-xs font-semibold" 
                : "bg-slate-100 text-slate-500 border-none shrink-0 px-3 py-1 text-xs font-semibold"
            }
          >
            {isPublished ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đang bán
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Ngừng bán
              </span>
            )}
          </Badge>
        ) : null
      }}
      sections={sections}
    />
  );
}
