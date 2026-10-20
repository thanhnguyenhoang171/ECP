'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Boxes, Eye, Package, Pencil, ShoppingBag, Star, Tag } from 'lucide-react';

import { Breadcrumbs } from '@/components/common';
import { RichTextContent } from '@/components/common/RichTextContent';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { formatCurrency } from '@/lib/formatters';
import { useProductCompositeDetail } from '../hooks/use-products';
import { ProductMediaGallery } from './ProductMediaGallery';

interface DetailSectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

const DetailSection = ({ title, children }: DetailSectionProps): React.JSX.Element => (
  <section className='min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
    <h2 className='text-base font-bold text-slate-900'>{title}</h2>
    {children}
  </section>
);

const formatDate = (value?: string): string => {
  if (!value) { return 'Chưa có thông tin'; }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa có thông tin' : date.toLocaleString('vi-VN');
};

const formatActor = (value: unknown): string => {
  if (!value) { return 'Chưa có thông tin'; }
  let actor: unknown = value;
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text.startsWith('{')) { return text || 'Chưa có thông tin'; }
    try {
      actor = JSON.parse(text);
    } catch {
      return 'Chưa có thông tin';
    }
  }
  if (actor && typeof actor === 'object') {
    for (const key of ['email', 'fullName', 'name', 'id']) {
      if (key in actor) {
        const label: unknown = Reflect.get(actor, key);
        if (typeof label === 'string' && label.trim()) { return label.trim(); }
      }
    }
  }
  return 'Chưa có thông tin';
};

export default function ProductDetailView(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const query = useProductCompositeDetail(id);
  const product = query.data?.product;

  if (query.isPending) {
    return <div aria-label='Đang tải chi tiết sản phẩm' className='space-y-6'><Skeleton className='h-20 w-full rounded-2xl' /><div className='grid gap-6 lg:grid-cols-2'><Skeleton className='aspect-square rounded-2xl' /><Skeleton className='h-96 rounded-2xl' /></div></div>;
  }

  if (query.isError || !product) {
    return <div className='flex min-h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center'>
      <Package size={48} className='text-slate-300' /><h1 className='text-xl font-bold'>Không thể tải chi tiết sản phẩm</h1>
      <p role='alert' className='max-w-lg text-sm text-slate-500'>{getApiErrorMessage(query.error, 'Sản phẩm không tồn tại hoặc bạn chưa có quyền xem.')}</p>
      <div className='flex gap-3'><Button variant='outline' asChild><Link href='/products'>Danh sách sản phẩm</Link></Button><Button onClick={() => { void query.refetch(); }}>Thử lại</Button></div>
    </div>;
  }

  const inventory = query.data?.skus ?? [];
  const variants = product.variants ?? [];
  const brand = query.data?.brand?.name || (typeof product.brand === 'string' ? product.brand : product.brand?.name) || 'Chưa có thương hiệu';
  const category = query.data?.category?.name || (typeof product.category === 'string' ? product.category : product.category?.name) || product.categoryName || 'Chưa phân loại';
  const rows = variants.length > 0 ? variants.map((variant) => {
    const sku = inventory.find((item) => item.id === variant.skuId || item.skuCode === variant.sku);
    return {
      id: variant.skuId || variant.sku,
      code: variant.sku,
      attributes: Object.entries(variant.attributes ?? {}).map(([key, value]) => `${key}: ${value}`).join(' · ') || 'Mặc định',
      price: sku?.price ?? variant.price,
      costPrice: sku?.costPrice ?? variant.costPrice,
      compareAtPrice: sku?.compareAtPrice ?? variant.compareAtPrice,
      stock: sku?.stockQuantity ?? variant.stock ?? 0,
      barcode: sku?.barcode || variant.barcode,
      barcodeType: sku?.barcodeType || variant.barcodeType,
      active: sku?.active ?? variant.isActive ?? variant.active ?? true,
    };
  }) : inventory.map((sku) => ({ id: sku.id, code: sku.skuCode, attributes: sku.variantName || 'Mặc định', price: sku.price, costPrice: sku.costPrice, compareAtPrice: sku.compareAtPrice, stock: sku.stockQuantity, barcode: sku.barcode, barcodeType: sku.barcodeType, active: sku.active }));
  const prices = rows.filter((row) => row.active).map((row) => row.price);
  const minPrice = prices.length ? Math.min(...prices) : undefined;
  const maxPrice = prices.length ? Math.max(...prices) : undefined;
  const totalStock = rows.reduce((total, row) => total + row.stock, 0);
  const specifications = Array.isArray(product.specifications) ? product.specifications : Object.entries(product.specifications ?? {}).map(([key, value]) => ({ key, value }));
  const published = product.isPublished ?? product.published ?? false;
  const metrics = [
    { label: 'Tổng tồn kho', value: totalStock.toLocaleString('vi-VN'), suffix: `${rows.length} biến thể`, icon: Boxes, color: 'text-blue-600 bg-blue-50' },
    { label: 'Đã bán', value: (product.soldCount ?? 0).toLocaleString('vi-VN'), suffix: 'sản phẩm', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lượt xem', value: (product.viewCount ?? 0).toLocaleString('vi-VN'), suffix: 'trên cửa hàng', icon: Eye, color: 'text-violet-600 bg-violet-50' },
    { label: 'Đánh giá', value: `${product.ratingAvg ?? 0}/5`, suffix: `${product.ratingCount ?? 0} lượt đánh giá`, icon: Star, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className='space-y-6 pb-8'>
      <Breadcrumbs items={[{ label: 'Sản phẩm', href: '/products', icon: Package }, { label: product.name }]} />
      <header className='flex flex-col justify-between gap-4 xl:flex-row xl:items-start'>
        <div className='min-w-0 space-y-2'>
          <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>Chi tiết sản phẩm</p>
          <h1 className='break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl'>{product.name}</h1>
          <p className='flex items-center gap-2 text-sm text-slate-500'><Tag size={14} className='shrink-0' />{brand} · {category}</p>
        </div>
        <div className='flex shrink-0 flex-wrap gap-2'>
          <Button variant='outline' asChild className='rounded-xl'><Link href='/products'><ArrowLeft size={16} />Danh sách</Link></Button>
          <Button asChild className='rounded-xl bg-blue-600 text-white hover:bg-blue-700'><Link href={`/products/${id}/edit`}><Pencil size={16} />Chỉnh sửa sản phẩm</Link></Button>
        </div>
      </header>

      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        {metrics.map(({ label, value, suffix, icon: Icon, color }) => <div key={label} className='min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
          <div className='mb-3 flex items-center justify-between gap-2'><span className='text-xs font-semibold text-slate-500'>{label}</span><span className={`rounded-lg p-2 ${color}`}><Icon size={16} /></span></div>
          <p className='break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl'>{value}</p><p className='mt-1 text-xs text-slate-400'>{suffix}</p>
        </div>)}
      </div>

      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='min-w-0 lg:col-span-5'><ProductMediaGallery key={product.id} product={product} /></div>
        <div className='min-w-0 space-y-6 lg:col-span-7'>
          <DetailSection title='Tổng quan sản phẩm'>
            <div className='flex flex-wrap gap-2 text-xs font-semibold'>
              <span className={`rounded-full border px-3 py-1 ${published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>{published ? 'Đang hiển thị trên cửa hàng' : 'Đang ẩn trên cửa hàng'}</span>
              {(product.isFeatured ?? product.featured) && <span className='rounded-full bg-violet-50 px-3 py-1 text-violet-700'>Nổi bật</span>}
              {(product.isNew ?? product.new) && <span className='rounded-full bg-blue-50 px-3 py-1 text-blue-700'>Sản phẩm mới</span>}
              {(product.isBestSeller ?? product.bestSeller) && <span className='rounded-full bg-amber-50 px-3 py-1 text-amber-700'>Bán chạy</span>}
            </div>
            <div className='rounded-xl bg-slate-50 p-4'>
              <p className='mb-1 text-xs font-medium text-slate-500'>Giá bán hiện tại</p>
              <p className='text-2xl font-black text-blue-700'>{minPrice === undefined ? 'Chưa có biến thể đang bán' : `${formatCurrency(minPrice)}${maxPrice !== minPrice ? ` – ${formatCurrency(maxPrice ?? minPrice)}` : ''}`}</p>
            </div>
            <dl className='grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2'>
              {[['SKU chính', product.sku], ['Thương hiệu', brand], ['Danh mục', category], ['Nhà cung cấp', query.data?.supplier?.name || query.data?.supplier?.supplierName], ['Đường dẫn', product.slug], ['ID sản phẩm', product.id]].map(([label, value]) => <div key={label} className='min-w-0'><dt className='mb-1 text-xs font-medium text-slate-400'>{label}</dt><dd className='break-all font-medium text-slate-700'>{value || 'Chưa có thông tin'}</dd></div>)}
            </dl>
          </DetailSection>
          <DetailSection title='Mô tả sản phẩm'><RichTextContent value={product.description} /></DetailSection>
        </div>
      </div>

      <DetailSection title={`Biến thể & tồn kho (${rows.length})`}>
        <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500'><p>Giá bán, mã vạch và tồn kho hiện tại theo từng SKU.</p><Link href={`/products/${id}/skus`} className='inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline'>Quản lý SKU<ArrowUpRight size={14} /></Link></div>
        <div className='overflow-x-auto rounded-xl border border-slate-200'>
          <table className='w-full min-w-[820px] text-left text-sm'>
            <thead className='bg-slate-50 text-xs font-semibold text-slate-500'><tr><th className='p-4'>SKU / Phân loại</th><th className='p-4'>Mã vạch</th><th className='p-4 text-right'>Giá bán / So sánh</th><th className='p-4 text-right'>Giá vốn</th><th className='p-4 text-right'>Tồn kho</th><th className='p-4'>Trạng thái</th></tr></thead>
            <tbody className='divide-y divide-slate-100'>
              {rows.map((row, index) => <tr key={row.id || index} className='hover:bg-slate-50/70'>
                <td className='p-4'><p className='font-mono text-xs font-bold text-slate-800'>{row.code || 'Chưa có SKU'}</p><p className='mt-1 max-w-64 whitespace-normal text-xs text-slate-500'>{row.attributes}</p></td>
                <td className='p-4'><p className='font-mono text-xs'>{row.barcode || '—'}</p>{row.barcode && <p className='mt-1 text-xs text-slate-400'>{row.barcodeType || 'Chưa xác định loại'}</p>}</td>
                <td className='p-4 text-right font-semibold text-slate-800'>{formatCurrency(row.price)}{row.compareAtPrice !== undefined && row.compareAtPrice > row.price && <del className='mt-1 block text-xs font-normal text-slate-400'>{formatCurrency(row.compareAtPrice)}</del>}</td>
                <td className='p-4 text-right text-slate-500'>{row.costPrice === undefined ? '—' : formatCurrency(row.costPrice)}</td>
                <td className={`p-4 text-right font-bold ${row.stock > 0 ? 'text-slate-800' : 'text-red-500'}`}>{row.stock.toLocaleString('vi-VN')}</td>
                <td className='p-4'><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${row.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{row.active ? 'Đang bán' : 'Ngừng bán'}</span></td>
              </tr>)}
              {rows.length === 0 && <tr><td colSpan={6} className='p-8 text-center text-slate-400'>Sản phẩm chưa có biến thể.</td></tr>}
            </tbody>
          </table>
        </div>
      </DetailSection>

      <div className='grid items-start gap-6 lg:grid-cols-2'>
        <DetailSection title='Thông số sản phẩm'>
          {specifications.length ? <dl className='divide-y divide-slate-100'>{specifications.map(({ key, value }, index) => <div key={`${key}-${index}`} className='grid grid-cols-2 gap-4 py-3 text-sm first:pt-0'><dt className='break-words font-medium text-slate-500'>{key}</dt><dd className='break-words text-slate-800'>{String(value)}</dd></div>)}</dl> : <p className='text-sm text-slate-400'>Chưa có thông số sản phẩm.</p>}
        </DetailSection>
        <DetailSection title='Thông tin quản lý'>
          <dl className='space-y-4 text-sm'>{[['Ngày tạo', formatDate(product.createdAt)], ['Cập nhật gần nhất', formatDate(product.updatedAt)], ['Người tạo', formatActor(product.createdBy)], ['Người cập nhật', formatActor(product.updatedBy)]].map(([label, value]) => <div key={label}><dt className='mb-1 text-xs text-slate-400'>{label}</dt><dd className='break-words text-slate-600'>{value || 'Chưa thiết lập'}</dd></div>)}</dl>
        </DetailSection>
      </div>
    </div>
  );
}
