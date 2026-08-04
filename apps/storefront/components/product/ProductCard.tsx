'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatVND } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
}

const emptySubscribe = () => () => {};

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

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#FFF9F2] rounded-2xl border border-amber-200/60 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-white/60 flex items-center justify-center p-3 overflow-hidden">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.discountPercent && (
            <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm tracking-tight">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-full shadow-xs">
              MỚI
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isWishlisted 
              ? 'text-rose-500' 
              : 'text-zinc-400 hover:text-rose-500'
          }`}
          aria-label="Thêm vào yêu thích"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </motion.button>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-xl">
          <Image
            src={product.images && product.images.length > 0 ? product.images[0] : '/tmp/bento.webp'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
            {product.category}
          </span>

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs font-semibold text-zinc-800 group-hover:text-amber-600 line-clamp-2 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-zinc-900 block">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-zinc-400 line-through font-normal">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => console.log('Add to cart:', product.id)}
            className="p-2.5 bg-[#1e293b] hover:bg-slate-700 text-[#F5C542] font-bold rounded-xl transition-all duration-200 text-xs flex items-center justify-center shadow-sm hover:shadow cursor-pointer border border-amber-500/20"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-4 h-4 text-[#F5C542]" />
          </motion.button>
        </div>

      </div>

    </motion.div>
  );
}
