'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable, type ColumnDef } from '@/components/common';
import { ProductVariant } from '../types/product.interface';
import { useProductDetail } from '../hooks/use-products';
import { useSkus } from '@/features/skus/hooks/use-skus';
import { inventoryApi } from '@/features/inventory/api/inventory.api';
import { formatCurrency } from '@/lib/formatters';
import { Layers, Package, Copy, Check, Barcode, Calendar, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ProductSkusDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type RichProductVariant = ProductVariant & {
  hasInventoryRecord?: boolean;
  variantName?: string;
  barcodeType?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

export default function ProductSkusDialog({
  productId,
  open,
  onOpenChange,
}: ProductSkusDialogProps) {
  const activeId = open && productId ? productId : '';
  const { data: product, isFetching: isProductFetching } = useProductDetail(activeId);
  const { data: skusResponse, isFetching: isSkusFetching } = useSkus({
    page: 1,
    size: 100,
    productId: activeId,
  });

  const { data: stocksData, isFetching: isStocksFetching } = useQuery({
    queryKey: ['inventory-stocks-modal', activeId],
    queryFn: inventoryApi.getStocks,
    enabled: open && Boolean(activeId),
  });

  const [copiedSku, setCopiedSku] = React.useState<string | null>(null);

  const handleCopySku = useCallback((skuCode: string) => {
    navigator.clipboard.writeText(skuCode);
    setCopiedSku(skuCode);
    toast.success(`Đã sao chép mã SKU: ${skuCode}`);
    setTimeout(() => setCopiedSku(null), 2000);
  }, []);

  const rawSkusData = skusResponse?.data;
  const apiSkusList = Array.isArray(rawSkusData)
    ? rawSkusData
    : Array.isArray((rawSkusData as any)?.data)
      ? (rawSkusData as any).data
      : [];

  const productVariants = product?.variants || [];
  const inventoryList = stocksData || [];

  // Merge API SKUs with Product Variants & Inventory Stock data
  const mappedApiVariants: RichProductVariant[] = apiSkusList.map((item: any) => {
    const skuCode = item.skuCode || item.sku || '';
    const skuId = item.id?.toString() || '';

    const matchingVariant = productVariants.find((v) => v.sku === skuCode || (v as any).skuId === skuId);
    const matchingInventory = inventoryList.find((inv: any) =>
      (inv.skuId && inv.skuId.toString() === skuId) ||
      (inv.skuCode && inv.skuCode === skuCode)
    );

    const hasInventoryRecord = Boolean(matchingInventory || item.stock !== undefined || item.quantityOnHand !== undefined);
    const stockQty = matchingInventory?.quantityOnHand ?? item.stock ?? item.quantityOnHand ?? matchingVariant?.stock ?? (product as any)?.stock ?? 0;

    return {
      id: skuId || matchingVariant?.id || '',
      sku: skuCode || 'N/A',
      variantName: item.variantName || matchingVariant?.attributes?.["Tên biến thể"] || matchingVariant?.attributes?.["Variant"] || '',
      barcodeType: item.barcodeType || (matchingVariant as any)?.barcodeType || 'EAN-13',
      price: matchingVariant?.price || matchingInventory?.sellingPrice || matchingInventory?.price || item.price || item.sellingPrice || (product as any)?.price || 0,
      stock: stockQty,
      hasInventoryRecord,
      attributes: matchingVariant?.attributes || item.attributes || item.optionValues || {},
      compareAtPrice: matchingVariant?.compareAtPrice || item.compareAtPrice || item.originalPrice,
      costPrice: matchingVariant?.costPrice || matchingInventory?.costPrice || item.costPrice,
      barcode: item.barcode || matchingVariant?.barcode,
      isActive: item.active !== undefined ? item.active : (matchingVariant?.isActive ?? product?.isPublished ?? true),
      createdAt: item.createdAt || (matchingVariant as any)?.createdAt || product?.createdAt,
      updatedAt: item.updatedAt || (matchingVariant as any)?.updatedAt || product?.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy,
    };
  });

  const variants: RichProductVariant[] = mappedApiVariants.length > 0
    ? mappedApiVariants
    : productVariants.length > 0
      ? productVariants.map((v) => {
          const matchingInventory = inventoryList.find((inv: any) =>
            (inv.skuId && inv.skuId.toString() === (v as any).skuId) ||
            (inv.skuCode && inv.skuCode === v.sku)
          );
          return {
            ...v,
            barcodeType: (v as any).barcodeType || 'EAN-13',
            stock: matchingInventory?.quantityOnHand ?? v.stock ?? (product as any)?.stock ?? 0,
            hasInventoryRecord: Boolean(matchingInventory || v.stock !== undefined),
          };
        })
      : product
        ? [{
            id: product.id,
            sku: product.sku || 'N/A',
            price: (product as any).price || 0,
            stock: (product as any).stock || 0,
            hasInventoryRecord: false,
            attributes: {},
            isActive: product.isPublished ?? true,
          }]
        : [];

  const isLoading = isProductFetching || isSkusFetching || isStocksFetching;

  const columns: ColumnDef<RichProductVariant>[] = useMemo(() => [
    {
      header: 'Mã SKU & ID',
      cell: (variant) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md w-fit">
            <span>{variant.sku}</span>
            <button
              onClick={() => handleCopySku(variant.sku)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
              title="Sao chép SKU"
            >
              {copiedSku === variant.sku ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {variant.id && variant.id.length > 10 && (
            <span className="font-mono text-[9px] text-slate-400 truncate max-w-[130px]" title={`ID: ${variant.id}`}>
              ID: {variant.id.substring(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Tên biến thể / Thuộc tính',
      cell: (variant) => {
        const attrs = Object.entries(variant.attributes || {});

        return (
          <div className="flex flex-col gap-1">
            {variant.variantName ? (
              <span className="text-xs font-bold text-slate-900">{variant.variantName}</span>
            ) : null}

            {attrs.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {attrs.map(([key, value]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="bg-amber-50 text-amber-900 border-amber-200/80 text-[10px] px-2 py-0.5 font-medium"
                  >
                    <span className="font-semibold">{key}:</span> {String(value)}
                  </Badge>
                ))}
              </div>
            ) : !variant.variantName ? (
              <span className="text-xs text-slate-400 italic">Mặc định (Standard)</span>
            ) : null}
          </div>
        );
      },
    },
    {
      header: 'Bảng giá (Đơn vị: VNĐ)',
      align: 'right',
      cell: (variant) => (
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-blue-600">
            {formatCurrency(variant.price)}
          </span>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
            <span className="text-[10px] text-slate-400 line-through">
              Gốc: {formatCurrency(variant.compareAtPrice)}
            </span>
          ) : null}
          {variant.costPrice ? (
            <span className="text-[10px] text-slate-500">
              Vốn: {formatCurrency(variant.costPrice)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Tồn kho (Kho hàng)',
      align: 'center',
      cell: (variant) => {
        const stock = variant.stock ?? 0;
        const hasRecord = variant.hasInventoryRecord;

        if (!hasRecord && stock === 0) {
          return (
            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] font-medium">
              Chưa tạo phiếu nhập kho
            </Badge>
          );
        }

        return (
          <Badge
            className={
              stock > 10
                ? 'bg-emerald-100 text-emerald-700 border-none text-[11px] font-semibold'
                : stock > 0
                ? 'bg-amber-100 text-amber-700 border-none text-[11px] font-semibold'
                : 'bg-rose-100 text-rose-700 border-none text-[11px] font-semibold'
            }
          >
            {stock > 0 ? `${stock} sản phẩm` : '0 (Hết hàng)'}
          </Badge>
        );
      },
    },
    {
      header: 'Mã vạch (Barcode)',
      cell: (variant) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-xs text-slate-700 font-mono">
            <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{variant.barcode || '---'}</span>
          </div>
          {variant.barcodeType && variant.barcode && (
            <span className="text-[9px] text-slate-400 font-mono pl-4">
              Loại: {variant.barcodeType}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Trạng thái & Kiểm toán',
      align: 'center',
      cell: (variant) => {
        const active = variant.isActive ?? true;
        const createdDateStr = variant.createdAt ? new Date(variant.createdAt).toLocaleDateString('vi-VN') : '';

        return (
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant={active ? 'default' : 'secondary'}
              className={active ? 'bg-emerald-100 text-emerald-700 border-none text-[10px]' : 'bg-slate-100 text-slate-500 text-[10px]'}
            >
              {active ? 'Khả dụng' : 'Tạm khóa'}
            </Badge>
            {createdDateStr ? (
              <span className="text-[9px] text-slate-400 flex items-center gap-1" title={`Ngày tạo: ${variant.createdAt}`}>
                <Calendar className="w-2.5 h-2.5" /> {createdDateStr}
              </span>
            ) : null}
            {variant.createdBy ? (
              <span className="text-[9px] text-slate-400 flex items-center gap-1" title={`Người tạo: ${variant.createdBy}`}>
                <UserIcon className="w-2.5 h-2.5" /> {variant.createdBy.split('@')[0]}
              </span>
            ) : null}
          </div>
        );
      },
    },
  ], [copiedSku, handleCopySku]);

  const thumbObj = product?.thumbnail as any;
  const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0 overflow-hidden relative">
              {thumbUrl ? (
                <Image src={thumbUrl} alt={product?.name || 'Product'} fill className="object-cover" unoptimized />
              ) : (
                <Layers className="w-6 h-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{product?.name || 'Danh sách biến thể SKU'}</span>
                {variants.length > 0 && (
                  <Badge className="bg-slate-900 text-white text-xs px-2 py-0.5">
                    {variants.length} SKU
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                {product?.brand && (
                  <span>
                    • Thương hiệu:{' '}
                    <strong>
                      {typeof product.brand === 'object' ? product.brand.name : product.brand}
                    </strong>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <DataTable
            columns={columns}
            data={variants}
            isLoading={isLoading}
            emptyState={{
              title: 'Chưa có biến thể SKU',
              description: 'Sản phẩm này chưa có bản ghi SKU nào trên hệ thống API.',
              icon: <Package className="h-10 w-10 text-amber-500 opacity-80" />,
              iconColor: 'bg-amber-50',
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
