'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import Banner from '@/components/home/Banner';
import CategoryGrid from '@/components/home/CategoryGrid';
import TodaySuggestions from '@/components/home/TodaySuggestions';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { getProductsServer } from '@/services/product.service';
import { Product } from '@/types/product';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProductsServer()
      .then((data) => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <Banner />

      {/* Featured Categories Grid */}
      <CategoryGrid />

      {/* SECTION: Sản phẩm bán chạy nhất */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Gợi ý Cacao & Socola nguyên chất
            </span>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Sản phẩm nổi bật bán chạy nhất
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1 text-zinc-900 font-semibold text-xs hover:text-amber-600 transition-colors cursor-pointer"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Scroll Grid */}
        <div className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(33.333%-11px)] md:auto-cols-[calc(25%-12px)] gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 scroll-smooth snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="snap-start">
                  <ProductSkeleton />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className="snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </section>

      {/* SECTION: Gợi Ý Hôm Nay */}
      <TodaySuggestions />

      {/* Editorial Promo Card */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-amber-100/80 via-yellow-100/50 to-amber-50 text-zinc-900 border border-amber-200/90 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
              Chương trình ưu đãi ăn vặt đặc biệt
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Giảm 20% Cho Combo Trà Sữa & Snack Thái
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed">
              Áp dụng tự động cho đơn hàng khi mua kèm 2 gói snack Bento hoặc bánh Pocky cùng 1 lon trà sữa ChaTraMue bất kỳ.
            </p>
          </div>

          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-[#F5C542] font-bold text-xs rounded-xl transition-all shrink-0 shadow-md cursor-pointer border border-amber-500/20"
          >
            <Tag className="w-3.5 h-3.5 text-[#F5C542]" /> Săn Combo ngay
          </Link>
        </div>
      </section>

    </div>
  );
}
