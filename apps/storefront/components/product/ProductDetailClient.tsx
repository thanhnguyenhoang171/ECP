'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Play, Star } from 'lucide-react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { ProductDescription } from './ProductDescription';
import { Product } from '@/types/product';
import { formatVND } from '@/utils/formatters';
import { useWishlistStore } from '@/store/wishlistStore';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps): React.JSX.Element {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const variants = product.variants || [];
  const variant = variants[variantIndex];
  const price = variant?.price ?? product.price;
  const originalPrice = variant?.compareAtPrice;
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const specifications = Object.entries(product.specifications || {});
  return (
    <div className='max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-10'>
      <nav className='text-xs text-slate-500'><Link href='/'>Trang chủ</Link> / <Link href='/products'>Sản phẩm</Link> / {product.name}</nav>
      <div className='grid gap-8 lg:grid-cols-2'>
        <div className='space-y-4 min-w-0'>
          <div className='relative aspect-square overflow-hidden rounded-2xl border bg-white'>
            {selectedVideo ? <video key={selectedVideo} src={selectedVideo} controls playsInline autoPlay preload='metadata' className='h-full w-full object-contain' aria-label={`Video ${product.name}`} />
              : <Image src={selectedImage || '/product-placeholder.svg'} alt={product.name} fill sizes='(max-width: 1024px) 100vw, 50vw' className='object-contain p-4' priority />}

          </div>
          <div className='flex gap-3 overflow-x-auto'>
            {product.videos?.map((video, index) => (
              <button key={`${video.url}-${index}`} type='button' aria-label={`Xem video ${index + 1}`} aria-pressed={selectedVideo === video.url} onClick={() => setSelectedVideo(video.url)} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-950 ${selectedVideo === video.url ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                <video src={`${video.url}#t=0.1`} muted playsInline preload='metadata' aria-hidden='true' className='pointer-events-none h-full w-full object-cover' />
                <span className='absolute inset-0 flex items-center justify-center bg-black/15'><Play className='h-8 w-8 rounded-full bg-black/55 p-1.5 text-white' fill='currentColor' aria-hidden='true' /></span>
              </button>
            ))}
            {product.images.map((image, index) => <button key={`${image}-${index}`} type='button' aria-label={`Xem ảnh ${index + 1}`} aria-pressed={!selectedVideo && selectedImage === image} onClick={() => { setSelectedVideo(null); setSelectedImage(image); }} className={`relative h-20 w-20 shrink-0 rounded-xl border bg-white ${!selectedVideo && selectedImage === image ? 'border-blue-600' : 'border-slate-200'}`}>
              <Image src={image} alt='' fill sizes='80px' className='object-contain p-2' />
            </button>)}
          </div>
        </div>
        <div className='space-y-6 min-w-0'>
          <div className='flex flex-wrap gap-2 text-xs'>
            {product.isNew && <span className='rounded-md bg-blue-50 px-3 py-1 text-blue-700'>Mới</span>}
            {product.isFeatured && <span className='rounded-md bg-violet-50 px-3 py-1 text-violet-700'>Nổi bật</span>}
            {product.isBestSeller && <span className='rounded-md bg-amber-50 px-3 py-1 text-amber-800'>Bán chạy</span>}
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold'>{product.name}</h1>
          <p className='text-sm text-slate-500'>{product.category}{product.brand ? ` · ${product.brand}` : ''}</p>
          <div className='flex flex-wrap items-center gap-3 text-sm text-slate-600'>
            <span className='inline-flex items-center gap-1'><Star className='h-4 w-4 text-amber-500' />{product.rating} / 5 ({product.reviewCount} đánh giá)</span>
            <span>Đã bán {product.soldCount ?? 0}</span><span>{product.viewCount ?? 0} lượt xem</span>
          </div>
          <div className='flex items-baseline gap-3 rounded-xl bg-slate-50 p-5'>
            <strong className='text-3xl text-blue-700'>{variants.length ? formatVND(price) : 'Tạm ngừng bán'}</strong>
            {originalPrice !== undefined && originalPrice > price && <del className='text-slate-400'>{formatVND(originalPrice)}</del>}
          </div>
          {variants.length > 0 ? <fieldset className='space-y-3'>
            <legend className='text-sm font-bold'>Chọn phân loại</legend>
            <div className='flex flex-wrap gap-2'>
              {variants.map((item, index) => <button key={item.skuId || item.sku || index} type='button' aria-pressed={variantIndex === index}
                onClick={() => { setSelectedVideo(null); setVariantIndex(index); setSelectedImage(item.image || product.images[0]); }}
                className={`rounded-xl border px-4 py-3 text-sm ${variantIndex === index ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'}`}>
                {Object.entries(item.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(' / ') || (variants.length === 1 ? 'Mặc định' : `Phân loại ${index + 1}`)}
              </button>)}
            </div>
          </fieldset> : <p className='text-sm text-slate-500'>Sản phẩm hiện chưa có phân loại đang bán.</p>}
          <button type='button' onClick={() => { const added = toggleItem(product); toast.success(added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'); }} className='inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm'>
            <Heart className='h-4 w-4 text-rose-500' /> Yêu thích
          </button>
        </div>
      </div>
      <section className='space-y-4 border-t pt-8'><h2 className='text-xl font-bold'>Mô tả sản phẩm</h2><ProductDescription description={product.description} /></section>
      {specifications.length > 0 && <section className='space-y-4'><h2 className='text-xl font-bold'>Thông số sản phẩm</h2><dl className='divide-y rounded-xl border p-4'>
        {specifications.map(([key, value]) => <div key={key} className='grid grid-cols-2 gap-4 py-3 text-sm'><dt className='font-semibold'>{key}</dt><dd>{String(value)}</dd></div>)}
      </dl></section>}
      {relatedProducts.length > 0 && <section className='space-y-6 border-t pt-8'><h2 className='text-xl font-bold'>Sản phẩm cùng danh mục</h2><ProductGrid products={relatedProducts} /></section>}
    </div>
  );
}
