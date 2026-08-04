'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';
import ProductForm from '@/features/products/components/ProductForm';
import { useProductDetail } from '@/features/products/hooks/use-products';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || '';

  const { data: activeProduct, isFetching: isLoading, isError } = useProductDetail(productId);

  const breadcrumbItems = [
    { label: 'Sản phẩm', href: '/products', icon: Package },
    { label: activeProduct?.name || 'Chi tiết', href: `/products/${productId}` },
    { label: 'Chỉnh sửa sản phẩm' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu chỉnh sửa sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (isError || !activeProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="w-16 h-16 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-slate-500">Sản phẩm cần chỉnh sửa không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => router.push('/products')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sản phẩm
        </Button>
      </div>
    );
  }

  // Transform activeProduct into initialData expected by ProductForm
  const initialData = {
    id: activeProduct.id,
    sku: activeProduct.sku || '',
    name: activeProduct.name || '',
    categoryId: activeProduct.categoryId || '',
    brandId: (activeProduct as any).brandId || '',
    brand: activeProduct.brand || '',
    isPublished: activeProduct.isPublished ?? (activeProduct as any).published ?? true,
    isFeatured: activeProduct.isFeatured ?? (activeProduct as any).featured ?? false,
    isNew: activeProduct.isNew ?? (activeProduct as any).new ?? false,
    isBestSeller: activeProduct.isBestSeller ?? (activeProduct as any).bestSeller ?? false,
    viewCount: activeProduct.viewCount || 0,
    soldCount: activeProduct.soldCount || 0,
    ratingAvg: activeProduct.ratingAvg || 0,
    ratingCount: activeProduct.ratingCount || 0,
    description: activeProduct.description || '',
    slug: activeProduct.slug || '',
    images: (activeProduct as any).images || [],
    specifications: (activeProduct as any).specifications || [],
    metaTitle: (activeProduct as any).metaTitle || '',
    metaDescription: (activeProduct as any).metaDescription || '',
    metaKeywords: (activeProduct as any).metaKeywords || '',
    variants: activeProduct.variants && activeProduct.variants.length > 0
      ? activeProduct.variants.map((v) => ({
          sku: v.sku,
          price: v.price,
          compareAtPrice: (v as any).compareAtPrice || 0,
          costPrice: (v as any).costPrice || 0,
          barcode: (v as any).barcode || '',
          barcodeType: (v as any).barcodeType || 'EAN-13',
          image: (v as any).image || '',
          isActive: (v as any).isActive !== undefined ? (v as any).isActive : true,
          attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })) as any,
        }))
      : [
          {
            sku: activeProduct.sku || 'SKU-DEFAULT',
            price: (activeProduct as any).price || 0,
            compareAtPrice: 0,
            costPrice: 0,
            barcode: '',
            barcodeType: 'EAN-13',
            image: '',
            isActive: true,
            attributes: [],
          },
        ],
  };

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={`Chỉnh sửa: ${activeProduct.name}`}
        description="Cập nhật thông tin chi tiết, hình ảnh, thông số kỹ thuật và các phân loại biến thể."
        actions={
          <Button
            variant="outline"
            onClick={() => router.push(`/products/${productId}`)}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Chi tiết
          </Button>
        }
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <ProductForm
          initialData={initialData as any}
          onSuccess={() => {
            toast.success('Cập nhật sản phẩm thành công');
            router.push(`/products/${productId}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
