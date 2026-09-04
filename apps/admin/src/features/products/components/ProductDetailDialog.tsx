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

  const brandName = typeof product?.brand === 'object' ? product?.brand?.name : (product?.brand || 'N/A');
  const categoryName = typeof product?.category === 'object' ? product?.category?.name : (categories.find(c => c.id === (typeof product?.category === 'object' ? product?.category?.id : product?.categoryId))?.name || 'Chưa phân loại');
  const isPublished = product?.isPublished ?? product?.published ?? false;

  const thumbObj = product?.thumbnail;
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
        { label: "Thương hiệu", value: brandName, icon: Tag },
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

  sections.push({
    title: "Chỉ số & Nhãn sản phẩm",
    cols: 2,
    items: [
      { label: "Sản phẩm nổi bật", value: product?.isFeatured ? 'Có' : 'Không', icon: Tag },
      { label: "Sản phẩm mới", value: product?.isNew ? 'Có' : 'Không', icon: Tag },
      { label: "Bán chạy nhất", value: product?.isBestSeller ? 'Có' : 'Không', icon: Tag },
      { label: "Lượt xem", value: product?.viewCount ?? 0, icon: Hash },
      { label: "Số lượng đã bán", value: product?.soldCount ?? 0, icon: ShoppingBag },
      { label: "Đánh giá trung bình", value: `${product?.ratingAvg ?? 0} ⭐ (${product?.ratingCount ?? 0} lượt)`, icon: Tag },
    ]
  });

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Không thể tải thông tin chi tiết sản phẩm từ máy chủ."
      createdAt={product?.createdAt}
      updatedAt={product?.updatedAt}
      header={{
        icon: Package,
        title: product?.name,
        subtitle: `SKU: ${product?.sku || 'N/A'} • Brand: ${brandName}`,
        badge: product ? (
          <div className="flex items-center gap-1.5 flex-wrap">
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
            {product.isFeatured && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2.5 py-0.5 font-semibold">Nổi bật</Badge>}
            {product.isNew && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5 font-semibold">Mới</Badge>}
            {product.isBestSeller && <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-2.5 py-0.5 font-semibold">Bán chạy</Badge>}
          </div>
        ) : null
      }}
      sections={sections}
    />
  );
}
