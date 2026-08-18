'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { Filter, Loader2, CheckCircle2 } from 'lucide-react';

const categoryList = [
  'Tất cả',
  'Cacao & Socola',
  'Bột Cacao Nguyên Chất',
  'Socola Thanh Craft',
];

interface ProductCatalogClientProps {
  initialProducts: Product[];
}

export default function ProductCatalogClient({ initialProducts }: ProductCatalogClientProps) {
  const [productsList] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [displayedCount, setDisplayedCount] = useState(8);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory === 'Tất cả'
    ? productsList
    : productsList.filter(p => p.category === selectedCategory);

  const visibleProducts = filteredProducts.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProducts.length;

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(filteredProducts.length, prev + 4));
            setIsFetchingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedCount, filteredProducts.length, hasMore, isFetchingMore]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setDisplayedCount(8);
  };

  return (
    <div className="space-y-8">
      {/* Title & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tất cả sản phẩm Thái Lan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị {visibleProducts.length} / {filteredProducts.length} sản phẩm (Cuộn xuống để tải thêm)
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categoryList.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Animated Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {visibleProducts.map((product) => (
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

      {/* Sentinel & Infinite Scroll Loader */}
      <div ref={observerTarget} className="py-8 flex flex-col items-center justify-center">
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Đang tải thêm sản phẩm...
          </div>
        )}

        {!hasMore && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã hiển thị toàn bộ {filteredProducts.length} sản phẩm</span>
          </div>
        )}
      </div>
    </div>
  );
}
