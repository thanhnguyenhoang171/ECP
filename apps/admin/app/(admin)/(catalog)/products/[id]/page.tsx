'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useProductDetail } from '@/features/products/hooks/use-products';
import { useUpdateProduct } from '@/features/products/hooks/use-product-mutation';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useActiveBrands } from '@/features/brands/hooks/use-brands';
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers';
import { useSkus } from '@/features/skus/hooks/use-skus';
import { skuApi } from '@/features/skus/api/sku.api';
import { inventoryApi } from '@/features/inventory/api/inventory.api';
import { formatCurrency } from '@/lib/formatters';
import {
  Breadcrumbs,
  PageHeader,
  DataTable,
  type ColumnDef,
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
  Save,
  Loader2,
  Image as ImageIcon,
  ShoppingBag,
  Truck,
  Globe,
  History,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Product, ProductVariant } from '@/features/products/types/product.interface';

interface SkuRecord {
  id: string | number;
  skuCode?: string;
  sku?: string;
  variantName?: string;
  barcode?: string;
  barcodeType?: string;
  stock?: number;
  quantityOnHand?: number;
  price?: number;
  sellingPrice?: number;
  costPrice?: number;
  compareAtPrice?: number;
  attributes?: Record<string, string | number | boolean>;
  active?: boolean;
  isActive?: boolean;
}

interface SupplierItem {
  id: string;
  name?: string;
  supplierName?: string;
}

interface InventoryStockItem {
  skuId?: string | number;
  skuCode?: string;
  quantityOnHand?: number;
  sellingPrice?: number;
  costPrice?: number;
  price?: number;
}

interface DisplayVariant {
  id: string;
  sku: string;
  variantName: string;
  barcodeType: string;
  price: number;
  costPrice: number;
  compareAtPrice: number;
  stock: number;
  hasInventoryRecord: boolean;
  attributes: Record<string, string | number | boolean>;
  barcode?: string;
  isActive: boolean;
}

export default function UnifiedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || '';

  // API Queries
  const { data: product, isFetching: isProductLoading, isError, refetch: refetchProduct } = useProductDetail(productId);
  const updateProductMutation = useUpdateProduct();

  const { data: categoriesData } = useCategories({ page: 0, size: 100 });
  const categoriesList = categoriesData?.data || [];

  const { data: activeBrands } = useActiveBrands();

  const { data: suppliersData } = useSuppliers();
  const suppliersList = (suppliersData || []) as SupplierItem[];

  const { data: skusResponse, isFetching: isSkusLoading, refetch: refetchSkus } = useSkus({
    page: 1,
    size: 100,
    productId,
  });

  const { data: stocksData, isFetching: isStocksLoading, refetch: refetchStocks } = useQuery({
    queryKey: ['inventory-stocks-unified', productId],
    queryFn: inventoryApi.getStocks,
    enabled: Boolean(productId),
  });

  // Local Editable Product Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: '',
    brandId: '',
    categoryId: '',
    supplierId: '',
    description: '',
    price: 0,
    costPrice: 0,
    compareAtPrice: 0,
    weight: 500, // grams
    length: 10,  // cm
    width: 10,   // cm
    height: 15,  // cm
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: '',
    isPublished: true,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  // Version History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // SKU Form Modal States (Add/Edit Variant)
  const [isSkuFormOpen, setIsSkuFormOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<DisplayVariant | null>(null);
  const [skuFormData, setSkuFormData] = useState({
    skuCode: '',
    variantName: '',
    barcode: '',
    barcodeType: 'EAN-13',
    price: 0,
    costPrice: 0,
    compareAtPrice: 0,
    active: true,
  });
  const [deleteSkuConfirmId, setDeleteSkuConfirmId] = useState<string | null>(null);
  const [isSkuSubmitting, setIsSkuSubmitting] = useState(false);

  // Sync Form Data when Product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        brand: product.brand || '',
        brandId: product.brandId || '',
        categoryId: product.categoryId || '',
        supplierId: product.supplierId || '',
        description: product.description || '',
        price: product.price || product.variants?.[0]?.price || 0,
        costPrice: product.costPrice || 0,
        compareAtPrice: product.compareAtPrice || 0,
        weight: product.weight || 500,
        length: product.dimensions?.length || 10,
        width: product.dimensions?.width || 10,
        height: product.dimensions?.height || 15,
        metaTitle: product.metaTitle || product.name || '',
        metaDescription: product.metaDescription || product.description || '',
        metaKeywords: product.metaKeywords || '',
        slug: product.slug || '',
        isPublished: product.isPublished ?? product.published ?? true,
        isFeatured: product.isFeatured ?? product.featured ?? false,
        isNew: product.isNew ?? product.new ?? false,
        isBestSeller: product.isBestSeller ?? product.bestSeller ?? false,
      });
      setIsDirty(false);
    }
  }, [product]);

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCopySku = (skuCode: string) => {
    navigator.clipboard.writeText(skuCode);
    setCopiedSku(skuCode);
    toast.success(`Đã sao chép SKU: ${skuCode}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Save Product Updates
  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập Tên sản phẩm');
      return;
    }
    setIsSaving(true);
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        values: {
          ...formData,
          images: (product?.images || []) as Array<Record<string, unknown> | string>,
          viewCount: product?.viewCount || 0,
          soldCount: product?.soldCount || 0,
          ratingAvg: product?.ratingAvg || 0,
          ratingCount: product?.ratingCount || 0,
          specifications: Array.isArray(product?.specifications)
            ? product.specifications.map((s) => ({ key: s.key, value: String(s.value) }))
            : product?.specifications && typeof product.specifications === 'object'
              ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
              : [],
          variants: product?.variants?.map((v) => ({
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice || 0,
            costPrice: v.costPrice || 0,
            barcode: v.barcode || '',
            barcodeType: v.barcodeType || 'EAN-13',
            image: typeof v.image === 'string' ? v.image : v.image?.url || '',
            isActive: v.isActive !== undefined ? v.isActive : true,
            attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value: String(value) })),
          })) || [{ sku: formData.sku, price: formData.price, compareAtPrice: 0, costPrice: 0, barcode: '', barcodeType: 'EAN-13', image: '', isActive: true, attributes: [] }],
        },
      });
      toast.success('Lưu thông tin sản phẩm thành công');
      setIsDirty(false);
      refetchProduct();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lưu thất bại';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // SKU CRUD Handlers
  const handleOpenCreateSku = () => {
    setEditingSku(null);
    setSkuFormData({
      skuCode: `${formData.sku || 'SKU'}-${Date.now().toString().slice(-4)}`,
      variantName: '',
      barcode: '',
      barcodeType: 'EAN-13',
      price: formData.price,
      costPrice: formData.costPrice,
      compareAtPrice: formData.compareAtPrice,
      active: true,
    });
    setIsSkuFormOpen(true);
  };

  const handleOpenEditSku = (skuItem: DisplayVariant) => {
    setEditingSku(skuItem);
    setSkuFormData({
      skuCode: skuItem.sku || '',
      variantName: skuItem.variantName || '',
      barcode: skuItem.barcode || '',
      barcodeType: skuItem.barcodeType || 'EAN-13',
      price: skuItem.price || 0,
      costPrice: skuItem.costPrice || 0,
      compareAtPrice: skuItem.compareAtPrice || 0,
      active: skuItem.isActive,
    });
    setIsSkuFormOpen(true);
  };

  const handleSubmitSkuForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuFormData.skuCode.trim()) {
      toast.error('Vui lòng nhập Mã SKU');
      return;
    }

    setIsSkuSubmitting(true);
    try {
      if (editingSku) {
        await skuApi.update(editingSku.id, {
          skuCode: skuFormData.skuCode,
          variantName: skuFormData.variantName,
          barcode: skuFormData.barcode,
          barcodeType: skuFormData.barcodeType,
          active: skuFormData.active,
        });
        toast.success('Cập nhật SKU thành công');
      } else {
        await skuApi.create({
          skuCode: skuFormData.skuCode,
          productId,
          productName: formData.name,
          variantName: skuFormData.variantName,
          barcode: skuFormData.barcode,
          barcodeType: skuFormData.barcodeType,
          active: skuFormData.active,
        });
        toast.success('Thêm SKU biến thể mới thành công');
      }

      setIsSkuFormOpen(false);
      refetchSkus();
      refetchProduct();
      refetchStocks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Thao tác SKU thất bại';
      toast.error(message);
    } finally {
      setIsSkuSubmitting(false);
    }
  };

  const handleDeleteSku = async () => {
    if (!deleteSkuConfirmId) return;
    setIsSkuSubmitting(true);
    try {
      await skuApi.delete(deleteSkuConfirmId);
      toast.success('Xóa SKU thành công');
      setDeleteSkuConfirmId(null);
      refetchSkus();
      refetchProduct();
      refetchStocks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xóa SKU thất bại';
      toast.error(message);
    } finally {
      setIsSkuSubmitting(false);
    }
  };

  // Process data for SKU table
  const rawSkusData = skusResponse?.data;
  const apiSkusList: SkuRecord[] = Array.isArray(rawSkusData)
    ? (rawSkusData as SkuRecord[])
    : Array.isArray((rawSkusData as unknown as { data?: SkuRecord[] })?.data)
      ? ((rawSkusData as unknown as { data: SkuRecord[] }).data)
      : [];

  const productVariants: ProductVariant[] = product?.variants || [];
  const inventoryList: InventoryStockItem[] = (stocksData || []) as InventoryStockItem[];

  const variants: DisplayVariant[] = apiSkusList.map((item) => {
    const skuCode = item.skuCode || item.sku || '';
    const skuId = item.id ? String(item.id) : '';

    const matchingVariant = productVariants.find((v) => v.sku === skuCode || v.skuId === skuId);
    const matchingInventory = inventoryList.find((inv) =>
      (inv.skuId && String(inv.skuId) === skuId) ||
      (inv.skuCode && inv.skuCode === skuCode)
    );

    const stockQty = matchingInventory?.quantityOnHand ?? item.stock ?? item.quantityOnHand ?? matchingVariant?.stock ?? product?.stock ?? 0;

    return {
      id: skuId || matchingVariant?.id || '',
      sku: skuCode || 'N/A',
      variantName: item.variantName || (matchingVariant?.attributes?.['Tên biến thể'] as string) || (matchingVariant?.attributes?.['Variant'] as string) || '',
      barcodeType: item.barcodeType || matchingVariant?.barcodeType || 'EAN-13',
      price: matchingVariant?.price || matchingInventory?.sellingPrice || matchingInventory?.price || item.price || item.sellingPrice || product?.price || 0,
      costPrice: matchingVariant?.costPrice || matchingInventory?.costPrice || item.costPrice || 0,
      compareAtPrice: matchingVariant?.compareAtPrice || item.compareAtPrice || 0,
      stock: stockQty,
      hasInventoryRecord: Boolean(matchingInventory || item.stock !== undefined),
      attributes: matchingVariant?.attributes || item.attributes || {},
      barcode: item.barcode || matchingVariant?.barcode,
      isActive: item.active !== undefined ? item.active : (matchingVariant?.isActive ?? true),
    };
  });

  const displayVariants: DisplayVariant[] = variants.length > 0 ? variants : productVariants.map((v) => ({
    id: v.id || v.sku,
    sku: v.sku,
    variantName: (v.attributes?.['Tên biến thể'] as string) || (v.attributes?.['Variant'] as string) || '',
    barcodeType: v.barcodeType || 'EAN-13',
    price: v.price,
    costPrice: v.costPrice || 0,
    compareAtPrice: v.compareAtPrice || 0,
    stock: v.stock || 0,
    hasInventoryRecord: false,
    attributes: v.attributes || {},
    barcode: v.barcode,
    isActive: v.isActive ?? true,
  }));

  const breadcrumbItems = [
    { label: 'Sản phẩm', href: '/products', icon: Package },
    { label: product?.name || 'Chi tiết sản phẩm' },
  ];

  const thumbObj = product?.thumbnail as any;
  const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;
  const images = (product as any)?.images || [];
  const galleryUrls: string[] = images.map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean);

  const skuColumns: ColumnDef<DisplayVariant>[] = [
    {
      header: 'Mã SKU',
      cell: (variant) => (
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
      ),
    },
    {
      header: 'Tên phân loại / Thuộc tính',
      cell: (variant) => {
        const attrs = Object.entries(variant.attributes || {});
        return (
          <div className="flex flex-col gap-1">
            {variant.variantName ? (
              <span className="text-xs font-bold text-slate-900">{variant.variantName}</span>
            ) : null}
            {attrs.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {attrs.map(([k, v]) => (
                  <Badge key={k} variant="outline" className="bg-amber-50 text-amber-900 border-amber-200 text-[10px]">
                    <span className="font-semibold">{k}:</span> {String(v)}
                  </Badge>
                ))}
              </div>
            ) : !variant.variantName ? (
              <span className="text-xs text-slate-400 italic">Mặc định</span>
            ) : null}
          </div>
        );
      },
    },
    {
      header: 'Giá bán / Vốn',
      align: 'right',
      cell: (variant) => (
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-blue-600 font-mono">
            {formatCurrency(variant.price)}
          </span>
          {variant.costPrice ? (
            <span className="text-[10px] text-slate-400 font-mono">
              Vốn: {formatCurrency(variant.costPrice)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Tồn kho',
      align: 'center',
      cell: (variant) => {
        const stock = variant.stock ?? 0;
        return (
          <Badge
            className={
              stock > 0
                ? 'bg-emerald-100 text-emerald-800 border-none text-[11px] font-semibold'
                : 'bg-slate-100 text-slate-600 border-none text-[11px] font-medium'
            }
          >
            {stock > 0 ? `${stock} sản phẩm` : 'Chưa nhập kho'}
          </Badge>
        );
      },
    },
    {
      header: 'Mã vạch',
      cell: (variant) => (
        <div className="flex items-center gap-1 text-xs text-slate-600 font-mono">
          <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{variant.barcode || '---'}</span>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (variant) => {
        const active = variant.isActive ?? true;
        return (
          <Badge variant={active ? 'default' : 'secondary'} className={active ? 'bg-emerald-100 text-emerald-800 border-none text-[10px]' : 'bg-slate-100 text-slate-500 text-[10px]'}>
            {active ? 'Khả dụng' : 'Khóa'}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (variant) => (
        <div className="flex justify-end gap-1">
          <EditActionButton onClick={() => handleOpenEditSku(variant)} />
          <DeleteActionButton onClick={() => setDeleteSkuConfirmId(variant.id)} />
        </div>
      ),
    },
  ];

  if (isProductLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="w-16 h-16 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <Badge className={formData.isPublished ? 'bg-emerald-100 text-emerald-800 border-none' : 'bg-slate-100 text-slate-600 border-none'}>
              {formData.isPublished ? 'Đang bán' : 'Ngừng bán'}
            </Badge>
            {isDirty && (
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 animate-pulse text-xs font-bold">
                ● Bản nháp chưa lưu
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>SKU chính: <strong className="font-mono text-slate-700">{product.sku}</strong></span>
            <span>• Mã ID: <strong className="font-mono text-slate-600">{product.id}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" /> Lịch sử phiên bản
          </Button>

          <Button variant="outline" size="sm" onClick={() => router.push('/products')} className="gap-1.5 text-xs cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Danh sách
          </Button>

          <Button
            onClick={handleSaveProduct}
            disabled={isSaving}
            size="sm"
            className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Lưu thay đổi (Ctrl+S)
          </Button>
        </div>
      </div>

      {/* Main 2-Column Shopify Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (70%) - Main Details & Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Product Information & Base Pricing */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" /> Thông tin cơ bản & Bảng giá
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Tên sản phẩm *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Mã SKU chính</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => handleFieldChange('sku', e.target.value)}
                    placeholder="VD: MAROU-DARK-70"
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Giá bán cơ sở (VNĐ)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                    placeholder="0"
                    className="font-mono text-xs font-bold text-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Giá vốn / Nhập (VNĐ)</Label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleFieldChange('costPrice', Number(e.target.value))}
                    placeholder="0"
                    className="font-mono text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Mô tả chi tiết sản phẩm</Label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  rows={4}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Physical Specifications & Shipping Properties */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" /> Thông số vật lý & Vận chuyển
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Trọng lượng (Gam)</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleFieldChange('weight', Number(e.target.value))}
                  placeholder="500"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Dài (cm)</Label>
                <Input
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleFieldChange('length', Number(e.target.value))}
                  placeholder="10"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Rộng (cm)</Label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleFieldChange('width', Number(e.target.value))}
                  placeholder="10"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Cao (cm)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleFieldChange('height', Number(e.target.value))}
                  placeholder="15"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Unified Variants & SKUs Management Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" /> Biến thể & Matrix SKU
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Quản lý giá bán, tồn kho thực tế và mã vạch từng SKU.</p>
              </div>

              <Button
                onClick={handleOpenCreateSku}
                size="sm"
                className="gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" /> Thêm biến thể SKU
              </Button>
            </div>

            <DataTable
              columns={skuColumns}
              data={displayVariants}
              isLoading={isSkusLoading || isStocksLoading}
              emptyState={{
                title: 'Chưa có biến thể SKU',
                description: 'Bấm nút "Thêm biến thể SKU" để tạo kích thước, màu sắc hoặc mã phân loại.',
                icon: <Layers className="h-10 w-10 text-amber-500 opacity-80" />,
                iconColor: 'bg-amber-50',
              }}
            />
          </div>

          {/* Section 4: SEO Metadata Optimization */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" /> Tối ưu SEO & Metadata
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Meta Title (Tiêu đề SEO)</Label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                  placeholder="Nhập tiêu đề tìm kiếm..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Meta Description (Mô tả SEO)</Label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('metaDescription', e.target.value)}
                  placeholder="Nhập mô tả chuẩn tìm kiếm Google..."
                  rows={2}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (30%) - Organization, Supplier & Settings */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Trạng thái kinh doanh
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPublishedToggle"
                checked={formData.isPublished}
                onChange={(e) => handleFieldChange('isPublished', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <Label htmlFor="isPublishedToggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Cho phép bán (Hiển thị trên gian hàng)
              </Label>
            </div>
          </div>

          {/* Supplier Linkage Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" /> Nhà cung cấp (Supplier)
            </h3>

            <div className="space-y-1.5">
              <select
                value={formData.supplierId}
                onChange={(e) => handleFieldChange('supplierId', e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Chọn Nhà cung cấp --</option>
                {suppliersList.map((sup: any) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name || sup.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Phân loại & Thương hiệu
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Danh mục sản phẩm</Label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Chọn danh mục --</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Thương hiệu</Label>
              <Input
                value={formData.brand}
                onChange={(e) => handleFieldChange('brand', e.target.value)}
                placeholder="VD: Marou Chocolate, Alluvia..."
                className="text-xs"
              />
            </div>
          </div>

          {/* Badges / Flags Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Nhãn sản phẩm
            </h3>

            <div className="space-y-2 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleFieldChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
                <span>Sản phẩm Nổi bật</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => handleFieldChange('isNew', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
                <span>Sản phẩm Mới</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => handleFieldChange('isBestSeller', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                />
                <span>Sản phẩm Bán chạy</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Lịch sử phiên bản sản phẩm
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Theo dõi lịch sử cập nhật và các lần điều chỉnh dữ liệu của sản phẩm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-60 overflow-y-auto custom-scrollbar text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Phiên bản 1.2 (Hiện tại)</span>
                <span className="text-emerald-600">Khả dụng</span>
              </div>
              <p className="text-slate-500">Cập nhật trọng lượng vận chuyển và thông tin SEO.</p>
              <span className="text-[10px] text-slate-400 block pt-1">Thực hiện: admin@ecp.com • 04/08/2026 16:30</span>
            </div>

            <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Phiên bản 1.0 (Khởi tạo)</span>
                <span className="text-slate-500">Đã lưu</span>
              </div>
              <p className="text-slate-500">Tạo mới bản ghi sản phẩm từ danh mục Bột Cacao.</p>
              <span className="text-[10px] text-slate-400 block pt-1">Thực hiện: system • 31/07/2026 16:55</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit SKU Variant Modal */}
      <Dialog open={isSkuFormOpen} onOpenChange={setIsSkuFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingSku ? 'Chỉnh sửa biến thể SKU' : 'Thêm mới biến thể SKU'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập mã SKU, tên phân loại và thông tin mã vạch cho sản phẩm này.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSkuForm} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Mã SKU *</Label>
              <Input
                value={skuFormData.skuCode}
                onChange={(e) => setSkuFormData({ ...skuFormData, skuCode: e.target.value })}
                placeholder="VD: MAROU-70-100G"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Tên phân loại / Biến thể</Label>
              <Input
                value={skuFormData.variantName}
                onChange={(e) => setSkuFormData({ ...skuFormData, variantName: e.target.value })}
                placeholder="VD: Thanh 80g / Hộp 500g"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Mã vạch (Barcode)</Label>
                <Input
                  value={skuFormData.barcode}
                  onChange={(e) => setSkuFormData({ ...skuFormData, barcode: e.target.value })}
                  placeholder="VD: 893600000002"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Loại mã vạch</Label>
                <select
                  value={skuFormData.barcodeType}
                  onChange={(e) => setSkuFormData({ ...skuFormData, barcodeType: e.target.value })}
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
                id="skuActiveCheck"
                checked={skuFormData.active}
                onChange={(e) => setSkuFormData({ ...skuFormData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
              />
              <Label htmlFor="skuActiveCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Trạng thái SKU khả dụng
              </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSkuFormOpen(false)} disabled={isSkuSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="bg-slate-900 text-white font-bold" disabled={isSkuSubmitting}>
                {isSkuSubmitting ? 'Đang lưu...' : editingSku ? 'Lưu biến thể' : 'Tạo biến thể'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete SKU Confirm */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteSkuConfirmId)}
        onClose={() => setDeleteSkuConfirmId(null)}
        onConfirm={handleDeleteSku}
        isLoading={isSkuSubmitting}
        title="Xác nhận xóa SKU"
        description="Bạn có chắc chắn muốn xóa biến thể SKU này không?"
      />
    </div>
  );
}
