import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Banner from '@/components/home/Banner';
import CategoryGrid from '@/components/home/CategoryGrid';
import TodaySuggestions from '@/components/home/TodaySuggestions';
import ProductCard from '@/components/product/ProductCard';
import { getProductsServer } from '@/services/server/product.server';

export default async function Home() {
  const products = await getProductsServer();

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
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
              Gợi ý Cacao & Socola nguyên chất
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Sản phẩm nổi bật bán chạy nhất
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-1 text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Scroll Grid */}
        <div className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[calc(33.333%-11px)] md:auto-cols-[calc(25%-12px)] gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-400 scroll-smooth snap-x snap-mandatory">
          {products.map((product) => (
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
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400">
              Chương trình ưu đãi ăn vặt đặc biệt
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Giảm 20% Cho Combo Trà Sữa & Snack Thái
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Áp dụng tự động cho đơn hàng khi mua kèm 2 gói snack Bento hoặc bánh Pocky cùng 1 lon trà sữa ChaTraMue bất kỳ.
            </p>
          </div>

          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shrink-0 shadow-2xs cursor-pointer border border-blue-600"
          >
            <span>Săn Combo ngay</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </section>

    </div>
  );
}
