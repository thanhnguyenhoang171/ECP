'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Package, Play } from 'lucide-react';

import { productImageUrl } from '../lib/product-form-values';
import { Product } from '../types/product.interface';

interface ProductMediaGalleryProps {
  readonly product: Product;
}

export const ProductMediaGallery = ({ product }: ProductMediaGalleryProps): React.JSX.Element => {
  const images = [...new Set([productImageUrl(product.thumbnail), ...(product.images ?? []).map(productImageUrl), ...(product.variants ?? []).map((variant) => productImageUrl(variant.image))].filter(Boolean))];
  const media = [...images.map((url) => ({ url, type: 'image' })), ...(product.videos ?? []).map((video) => ({ url: video.url, type: 'video' }))];
  const [selected, setSelected] = useState(0);
  const current = media[selected] ?? media[0];

  return (
    <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='relative flex aspect-square items-center justify-center bg-slate-50'>
        {!current ? <div className='space-y-3 text-center text-slate-400'><Package size={64} strokeWidth={1} className='mx-auto' /><p className='text-sm'>Chưa có hình ảnh sản phẩm</p></div>
          : current.type === 'video' ? <video key={current.url} src={current.url} controls playsInline autoPlay className='h-full w-full object-contain' aria-label={`Video ${product.name}`} />
            : <Image src={current.url} alt={product.name} fill sizes='(max-width: 1024px) 100vw, 40vw' className='object-contain p-6' unoptimized />}
        <span className='absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm'>
          {current?.type === 'video' ? 'Video sản phẩm' : 'Hình ảnh sản phẩm'}
        </span>
      </div>
      <div className='space-y-3 border-t border-slate-100 p-4'>
        <div className='flex items-center gap-2 text-xs font-medium text-slate-500'><ImageIcon size={14} />{images.length} ảnh · {product.videos?.length ?? 0} video</div>
        {media.length > 0 && <div className='flex gap-2 overflow-x-auto pb-1'>
          {media.map((item, index) => (
            <button key={`${item.type}-${item.url}-${index}`} type='button' aria-label={`Xem ${item.type === 'video' ? 'video' : 'ảnh'} ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)} className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors ${selected === index ? 'border-blue-600' : 'border-slate-200 hover:border-blue-300'}`}>
              {item.type === 'image' ? <Image src={item.url} alt='' fill sizes='64px' className='object-contain p-1' unoptimized />
                : <><video src={`${item.url}#t=0.1`} muted preload='metadata' playsInline className='pointer-events-none h-full w-full object-cover' aria-hidden='true' /><span className='absolute inset-0 flex items-center justify-center bg-black/25'><Play size={24} fill='white' className='text-white' aria-hidden='true' /></span></>}
            </button>
          ))}
        </div>}
      </div>
    </section>
  );
};
