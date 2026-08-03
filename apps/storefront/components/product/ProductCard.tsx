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
      className="group bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
    >
      
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-zinc-50 flex items-center justify-center p-4">
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.discountPercent && (
            <span className="px-2 py-0.5 bg-[#e8a29a] text-[#1e1b18] text-[10px] font-bold rounded shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-900 border border-zinc-300 text-[10px] font-medium rounded">
              MỚI
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-md transition-colors cursor-pointer ${
            isWishlisted 
              ? 'bg-rose-50 text-red-500' 
              : 'text-zinc-400 hover:text-red-500 hover:bg-zinc-100'
          }`}
          aria-label="Thêm vào yêu thích"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.button>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-lg">
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
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {product.category}
          </span>

          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs font-semibold text-zinc-900 line-clamp-2 hover:text-zinc-600 transition-colors mt-0.5 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-[#f5c542]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? 'fill-[#f5c542] text-[#f5c542]' : 'text-zinc-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-zinc-900 block">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-zinc-400 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => console.log('Add to cart:', product.id)}
            className="p-2 bg-[#f5c542] hover:bg-[#e5b32e] text-[#1e1b18] font-bold rounded-lg transition-colors text-xs flex items-center justify-center shadow-sm"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </motion.button>
        </div>

      </div>

    </motion.div>
  );
}
