'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useProductDetail } from '@/features/products/hooks/use-products';
import { useSkus } from '@/features/skus/hooks/use-skus';
import { skuApi } from '@/features/skus/api/sku.api';
import { inventoryApi } from '@/features/inventory/api/inventory.api';
import { formatCurrency } from '@/lib/formatters';
import { Sku } from '@/features/skus/types/sku.interface';
import {
  Breadcrumbs,
  PageHeader,
  DataTable,
  type ColumnDef,
  DataCard,
} from '@/components/common';
import {
  DeleteConfirmDialog,
  EditActionButton,
  DeleteActionButton,
} from '@/components/common/view-control';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Package,
  Layers,
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Barcode,
  Calendar,
  User as UserIcon,
  Tag,
  Hash,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductSkusPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || '';

  // Fetch parent Product info
  const { data: product, isFetching: isProductFetching, refetch: refetchProduct } = useProductDetail(productId);

  // Fetch SKUs from backend API /v1/skus?productId=...
  const { data: skusResponse, isFetching: isSkusFetching, refetch: refetchSkus } = useSkus({
    page: 1,
    size: 100,
    productId: productId,
  });

  // Fetch Inventory stocks for this product's SKUs
  const { data: stocksData, isFetching: isStocksFetching, refetch: refetchStocks } = useQuery({
    queryKey: ['inventory-stocks-page', productId],
    queryFn: inventoryApi.getStocks,
    enabled: Boolean(productId),
  });

  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Form dialog states for Create & Edit SKU
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<Sku | null>(null);

  // Form input fields
  const [formData, setFormData] = useState({
    skuCode: '',
    variantName: '',
    barcode: '',
    barcodeType: 'EAN-13',
    price: 0,
    costPrice: 0,
    compareAtPrice: 0,
    active: true,
  });

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopySku = (skuCode: string) => {
    navigator.clipboard.writeText(skuCode);
    setCopiedSku(skuCode);
    toast.success(`Đã sao chép mã SKU: ${skuCode}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingSku(null);
    setFormData({
      skuCode: `${product?.sku || 'SKU'}-${Date.now().toString().slice(-4)}`,
      variantName: '',
      barcode: '',
      barcodeType: 'EAN-13',
      price: product?.variants?.[0]?.price || (product as any)?.price || 0,
      costPrice: 0,
      compareAtPrice: 0,
      active: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (skuItem: any) => {
    setEditingSku(skuItem);
    setFormData({
      skuCode: skuItem.sku || skuItem.skuCode || '',
      variantName: skuItem.variantName || '',
      barcode: skuItem.barcode || '',
      barcodeType: skuItem.barcodeType || 'EAN-13',
      price: skuItem.price || 0,
      costPrice: skuItem.costPrice || 0,
      compareAtPrice: skuItem.compareAtPrice || 0,
      active: skuItem.active ?? skuItem.isActive ?? true,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.skuCode.trim()) {
      toast.error('Vui lòng nhập Mã SKU');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSku) {
        // Update existing SKU
        await skuApi.update(editingSku.id, {
          skuCode: formData.skuCode,
          variantName: formData.variantName,
          barcode: formData.barcode,
          barcodeType: formData.barcodeType,
          active: formData.active,
        });
        toast.success('Cập nhật SKU thành công!');
      } else {
        // Create new SKU
        await skuApi.create({
          skuCode: formData.skuCode,
          productId: productId,
          productName: product?.name,
          variantName: formData.variantName,
          barcode: formData.barcode,
          barcodeType: formData.barcodeType,
          active: formData.active,
        });
        toast.success('Thêm mới SKU thành công!');
      }

      setIsFormOpen(false);
      refetchSkus();
      refetchProduct();
      refetchStocks();
    } catch (err: any) {
      toast.error(err.message || 'Thao tác SKU thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSku = async () => {
    if (!deleteConfirmId) return;
    setIsSubmitting(true);
    try {
      await skuApi.delete(deleteConfirmId);
      toast.success('Xóa SKU thành công!');
      setDeleteConfirmId(null);
      refetchSkus();
      refetchProduct();
      refetchStocks();
    } catch (err: any) {
      toast.error(err.message || 'Xóa SKU thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process data sources
  const rawSkusData = skusResponse?.data;
  const apiSkusList = Array.isArray(rawSkusData)
    ? rawSkusData
    : Array.isArray((rawSkusData as any)?.data)
      ? (rawSkusData as any).data
      : [];

  const productVariants = product?.variants || [];
  const inventoryList = stocksData || [];

  // Merge API SKUs with Product Variants & Inventory Stock data
  const mappedApiVariants: any[] = apiSkusList.map((item: any) => {
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
    };
  });

  const variants: any[] = mappedApiVariants.length > 0
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

  const breadcrumbItems = [
    { label: 'Sản phẩm', href: '/products', icon: Package },
    { label: product?.name || 'Sản phẩm', href: `/products/${productId}`, icon: ShoppingBag },
    { label: 'Quản lý SKU biến thể', icon: Layers },
  ];

  const thumbObj = product?.thumbnail as any;
  const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

  const columns: ColumnDef<any>[] = [
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
      header: 'Bảng giá (VNĐ)',
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
      cell: (variant: any) => {
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
      header: 'Trạng thái',
      align: 'center',
      cell: (variant) => {
        const active = variant.isActive ?? true;

        return (
          <Badge
            variant={active ? 'default' : 'secondary'}
            className={active ? 'bg-emerald-100 text-emerald-700 border-none text-[10px]' : 'bg-slate-100 text-slate-500 text-[10px]'}
          >
            {active ? 'Khả dụng' : 'Tạm khóa'}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác CRUD',
      align: 'right',
      cell: (variant) => (
        <div className="flex justify-end gap-1">
          <EditActionButton onClick={() => handleOpenEdit(variant)} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(variant.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={`${product?.name || 'Sản phẩm'}`}
        description="Thêm mới, chỉnh sửa và quản lý danh sách biến thể SKU của sản phẩm."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/products/${productId}`)}
              className="gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Chi tiết
            </Button>

            <Button
              onClick={handleOpenCreate}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm SKU mới
            </Button>
          </div>
        }
      />

      {/* Parent Product Info Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative shrink-0">
            {thumbUrl ? (
              <Image src={thumbUrl} alt={product?.name || 'Product'} fill className="object-cover" unoptimized />
            ) : (
              <Package className="w-8 h-8 text-slate-400 absolute inset-0 m-auto" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{product?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              {product?.brand && (
                <span>
                  • Thương hiệu:{' '}
                  <strong>
                    {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </strong>
                </span>
              )}
            </p>
          </div>
        </div>

        <Badge className="bg-amber-100 text-amber-900 border border-amber-200 text-xs px-3 py-1 font-bold">
          Tổng cộng: {variants.length} SKU biến thể
        </Badge>
      </div>

      {/* Main SKU Table */}
      <DataCard>
        <DataTable
          columns={columns}
          data={variants}
          isLoading={isLoading}
          emptyState={{
            title: 'Chưa có biến thể SKU',
            description: 'Bấm nút "Thêm SKU mới" để khởi tạo biến thể phân loại sản phẩm.',
            icon: <Layers className="h-10 w-10 text-amber-500 opacity-80" />,
            iconColor: 'bg-amber-50',
          }}
        />
      </DataCard>

      {/* Create / Edit SKU Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingSku ? 'Chỉnh sửa thông tin SKU' : 'Thêm mới SKU biến thể'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {editingSku ? 'Cập nhật mã vạch, tên phân loại và trạng thái SKU.' : 'Tạo mã biến thể phân loại SKU mới cho sản phẩm này.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mã SKU *</Label>
              <Input
                value={formData.skuCode}
                onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                placeholder="VD: MAROU-DARK-70-100G"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tên biến thể / Phân loại</Label>
              <Input
                value={formData.variantName}
                onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                placeholder="VD: Thanh 80g / Hộp 500g"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Mã vạch (Barcode)</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="VD: 893600000002"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Loại mã vạch</Label>
                <select
                  value={formData.barcodeType}
                  onChange={(e) => setFormData({ ...formData, barcodeType: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="EAN-13">EAN-13</option>
                  <option value="UPC">UPC</option>
                  <option value="CODE-128">CODE-128</option>
                  <option value="QR_CODE">QR Code</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="skuActiveToggle"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <Label htmlFor="skuActiveToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                Cho phép SKU hoạt động (Khả dụng)
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-slate-900 text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : editingSku ? 'Lưu cập nhật' : 'Tạo SKU'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteSku}
        isLoading={isSubmitting}
        title="Xác nhận xóa SKU"
        description="Bạn có chắc chắn muốn xóa bản ghi SKU này không? Thao tác này không thể hoàn tác."
      />
    </div>
  );
}
