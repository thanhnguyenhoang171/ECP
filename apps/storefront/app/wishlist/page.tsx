'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();

  const handleClearAll = () => {
    clearWishlist();
    toast.info('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích.');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8 min-h-[70vh]">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">Danh sách yêu thích</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-1">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> Bộ sưu tập yêu thích
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Sản phẩm yêu thích ({items.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Lưu giữ các món ăn vặt & thức uống Thái Lan bạn yêu thích để mua sắm thuận tiện hơn
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-zinc-200 hover:border-red-200 text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 bg-rose-50 text-red-400 rounded-3xl mx-auto flex items-center justify-center border border-red-100 shadow-sm">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900">
              Danh sách yêu thích của bạn đang trống
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Hãy thả tim <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> các món snack, trà sữa và đồ ăn Thái Lan bạn thích để dễ dàng xem lại và đặt hàng bất cứ lúc nào!
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] font-extrabold text-xs rounded-xl transition-all shadow-md border border-amber-500/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F5C542]" /> Khám phá sản phẩm ngay <ArrowRight className="w-4 h-4 text-[#F5C542]" />
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
