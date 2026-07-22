'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DetailDialog, DetailSection } from '@/components/common';
import { Sku } from '../types/sku.interface';
import { 
  Layers, 
  Hash, 
  Barcode, 
  ShoppingBag, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';

interface SkuDetailDialogProps {
  sku: Sku | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SkuDetailDialog({
  sku,
  open,
  onOpenChange,
}: SkuDetailDialogProps) {
  if (!sku) return null;

  const sections: DetailSection[] = [
    {
      title: "Thông tin định danh SKU",
      cols: 2,
      items: [
        { label: "Mã SKU", value: sku.skuCode, icon: Hash, fontMono: true },
        { label: "Mã vạch (Barcode)", value: sku.barcode || 'N/A', icon: Barcode, fontMono: true },
        { label: "Loại mã vạch", value: sku.barcodeType || 'N/A', icon: FileText },
        { label: "ID đơn vị SKU", value: sku.id, icon: Hash, fontMono: true },
      ]
    },
    {
      title: "Sản phẩm & Biến thể",
      cols: 2,
      items: [
        { label: "Sản phẩm sở hữu", value: sku.productName || 'N/A', icon: ShoppingBag },
        { label: "Tên biến thể phân loại", value: sku.variantName || 'N/A', icon: SlidersHorizontal },
      ]
    }
  ];

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      createdAt={sku.createdAt}
      updatedAt={sku.updatedAt}
      header={{
        icon: Layers,
        title: sku.skuCode,
        subtitle: `Sản phẩm: ${sku.productName || 'N/A'} • Biến thể: ${sku.variantName || 'N/A'}`,
        badge: (
          <Badge 
            className={
              sku.active 
                ? "bg-blue-100 text-blue-700 border-none shrink-0 px-3 py-1 text-xs font-semibold" 
                : "bg-slate-100 text-slate-500 border-none shrink-0 px-3 py-1 text-xs font-semibold"
            }
          >
            {sku.active ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Tạm ngừng
              </span>
            )}
          </Badge>
        )
      }}
      sections={sections}
    />
  );
}
