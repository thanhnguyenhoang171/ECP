'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import Banner from '@/components/home/Banner';
import CategoryGrid from '@/components/home/CategoryGrid';
import TodaySuggestions from '@/components/home/TodaySuggestions';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { mockProducts } from '@/data/mockProducts';

export default function Home() {
  const isLoading = false;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <Banner />

      {/* Featured Categories Grid */}
      <CategoryGrid />

      {/* SECTION: Snack & Đồ uống bán chạy (Horizontal Scroll Slider) */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
              Gợi ý ăn vặt chuẩn vị
            </span>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Snack & Đồ uống bán chạy nhất tuần này
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1 text-zinc-900 font-semibold text-xs hover:text-amber-600 transition-colors cursor-pointer"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-zinc-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#F5C542]"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                  <ProductSkeleton />
                </div>
              ))
            : mockProducts.map((product) => (
                <div key={product.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C542] hover:bg-[#E5B32E] text-zinc-900 font-bold text-xs rounded-lg transition-colors shrink-0 shadow-md cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" /> Săn Combo ngay
          </Link>
        </div>
      </section>

    </div>
  );
}
