'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatVND } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

const emptySubscribe = () => () => {};

const formatSoldCount = (count?: number) => {
  if (!count) return null;
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return count.toString();
};

export default function ProductCard({ product }: ProductCardProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = mounted ? isInWishlist(product.id) : false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleItem(product);
    if (added) {
      toast.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
    } else {
      toast.info(`Đã xóa "${product.name}" khỏi danh sách yêu thích.`);
    }
  };

  const soldText = formatSoldCount(product.soldCount ?? (product.reviewCount ? product.reviewCount * 4 : 120));

  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5 transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden border-b border-slate-100">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.discountPercent && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded-md shadow-2xs tracking-tight">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-medium rounded-md">
              Mới
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-1 flex items-center justify-center transition-transform cursor-pointer hover:scale-110 drop-shadow-sm"
          aria-label="Thêm vào yêu thích"
        >
          <Heart className={`w-5 h-5 transition-colors text-rose-500 ${
            isWishlisted ? 'fill-rose-500' : 'fill-transparent hover:fill-rose-500/30'
          }`} />
        </button>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="w-full h-full relative block overflow-hidden">
          <Image
            src={product.images && product.images.length > 0 ? product.images[0] : '/tmp/bento.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-103 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            {product.category}
          </span>

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-700 font-semibold">{product.rating}</span>
            <span className="text-[10px] text-slate-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Sold Count */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-slate-900">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through font-normal">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {soldText && (
            <span className="text-[11px] text-slate-400 font-normal shrink-0">
              Đã bán {soldText}
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
