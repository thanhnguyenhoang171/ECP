'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Tag, TrendingUp, Gift, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { todaySuggestions } from '@/data/mockProducts';

export default function TodaySuggestions() {
  const isLoading = false;
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<'all' | 'hot' | 'spicy' | 'cool' | 'combo'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const handleTabChange = (tabId: any) => {
    setActiveSuggestionTab(tabId);
    setCurrentPage(1);
  };

  const filteredSuggestions = activeSuggestionTab === 'all'
    ? todaySuggestions
    : todaySuggestions.filter(item => item.tag === activeSuggestionTab || (activeSuggestionTab === 'spicy' && item.slug.includes('bento')));

  const totalPages = Math.max(1, Math.ceil(filteredSuggestions.length / itemsPerPage));
  const paginatedSuggestions = filteredSuggestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pt-4">
      {/* Header & Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-800" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Gợi ý món ngon hôm nay
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Tổng hợp các món ăn vặt, trà sữa và đồ nướng chuẩn vị Thái được mua nhiều nhất
          </p>
        </div>

        {/* Suggestion Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Tất cả gợi ý', icon: Tag },
            { id: 'hot', label: 'Bán chạy nhất', icon: TrendingUp },
            { id: 'spicy', label: 'Vị cay Thái', icon: Flame },
            { id: 'cool', label: 'Giải khát mát lạnh', icon: Sparkles },
            { id: 'combo', label: 'Combo tiết kiệm', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSuggestionTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1e1b18] text-[#F5C542] shadow-xs border border-amber-500/30 font-bold'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F5C542]' : 'text-zinc-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Products */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuggestionTab + '-' + currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {paginatedSuggestions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-zinc-200/80 text-xs">
          <p className="text-zinc-500 font-medium">
            Hiển thị <span className="font-bold text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredSuggestions.length)}</span> trên tổng số <span className="font-bold text-zinc-900">{filteredSuggestions.length}</span> gợi ý
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#1e1b18] text-[#F5C542] shadow-xs border border-amber-500/30 font-bold'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
