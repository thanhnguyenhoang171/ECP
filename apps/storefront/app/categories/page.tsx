'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Cookie, 
  Coffee, 
  Utensils, 
  Flame, 
  Sparkles, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Apple,
  Fish,
  Zap,
  Gift,
  Soup
} from 'lucide-react';

const allCategories = [
  {
    name: 'Snack & Bánh kẹo Thái Lan',
    slug: 'snack-candies',
    count: '120+ sản phẩm',
    description: 'Thiên đường bánh kẹo Bento cay giòn, Pocky chuối thơm béo, kẹo ngậm Playmore mát lạnh.',
    icon: Cookie,
    featured: ['Snack Bento Cay', 'Pocky Chuối', 'Kẹo Playmore Xi Muội'],
  },
  {
    name: 'Nước giải khát & Trà sữa Thái',
    slug: 'beverages',
    count: '85+ sản phẩm',
    description: 'Trải nghiệm trà sữa Thái đỏ ChaTraMue chuẩn gốc Băng Cốc, trà chanh thảo mộc & nước dừa tươi nguyên chất.',
    icon: Coffee,
    featured: ['Trà sữa ChaTraMue', 'Trà chanh Pokka', 'Nước dừa Koh Coconut'],
  },
  {
    name: 'Đồ ăn vặt & Mì ăn liền',
    slug: 'instant-foods',
    count: '90+ sản phẩm',
    description: 'Tổng hợp các loại mì tôm chua cay Tom Yum Goong Mama, mì xào khô, cơm cháy & hải sản sấy cay chuẩn vị.',
    icon: Utensils,
    featured: ['Mì Tom Yum Mama', 'Mực sấy Bento Hũ', 'Cơm cháy Thái Lan'],
  },
  {
    name: 'Món Cay & Tom Yum',
    slug: 'spices-sauces',
    count: '45+ sản phẩm',
    description: 'Bộ sưu tập snack cay xé lưỡi, ớt sấy giòn Tom Yum, sốt chấm và gia vị truyền thống Xứ sở Chùa Vàng.',
    icon: Flame,
    featured: ['Bento Siêu Cay Cam', 'Ớt sấy Tom Yum', 'Sốt Ớt Đỏ Thái Lan'],
  },
  {
    name: 'Trái cây sấy khô',
    slug: 'dried-fruits',
    count: '60+ sản phẩm',
    description: 'Sầu riêng sấy thăng hoa Monthong béo ngậy, xoài sấy dẻo hoàng gia, dừa nướng giòn rụm nguyên vị tự nhiên.',
    icon: Sparkles,
    featured: ['Sầu riêng Monthong', 'Xoài sấy dẻo', 'Dừa sấy Crispy Coconut'],
  },
  {
    name: 'Hải sản sấy cay & Khô Thái',
    slug: 'seafood-dried',
    count: '55+ sản phẩm',
    description: 'Khô mực tẩm vị spicy, cá sấy giòn tan tẩm vừng và tôm sấy Tom Yum đậm vị biển nhiệt đới.',
    icon: Fish,
    featured: ['Khô mực Bento', 'Cá sấy tẩm vừng', 'Tôm sấy Tom Yum'],
  },
  {
    name: 'Bánh Quy & Bánh Bông Lan',
    slug: 'cakes-biscuits',
    count: '70+ sản phẩm',
    description: 'Bánh bông lan Euro Cake nhân trứng muối dẻo thơm, bánh que Choki Choki và bánh bắp nướng giòn.',
    icon: Apple,
    featured: ['Euro Cake Trứng Muối', 'Choki Choki Socola', 'Bánh Bắp Nướng'],
  },
  {
    name: 'Đậu Phộng & Hạt Sấy Khô',
    slug: 'nuts-seeds',
    count: '40+ sản phẩm',
    description: 'Đậu phộng nước cốt dừa Koh-Kae giòn rụm, hạt đậu hà lan sấy muối biển bùi béo bổ dưỡng.',
    icon: Zap,
    featured: ['Koh-Kae Cốt Dừa', 'Đậu Hà Lan Muối Biển', 'Hạt Điều Sấy Thái'],
  },
  {
    name: 'Combo Ăn Vặt Tiết Kiệm',
    slug: 'combo-promos',
    count: '35+ combo hot',
    description: 'Trọn bộ các gói combo ăn vặt đêm khuya, combo trà sữa kèm snack được ưu đãi lên tới 25%.',
    icon: Gift,
    featured: ['Combo Đêm Khuya', 'Combo Trà Sữa Bento', 'Combo Trái Cây Sấy'],
  },
  {
    name: 'Gia vị & Sốt Lẩu Tom Yum',
    slug: 'spices-hotpot',
    count: '30+ loại gia vị',
    description: 'Cốt sốt lẩu Tom Yum Thái chuẩn vị, lá chanh Kaffir sấy khô, ớt khô sấy tẩm truyền thống.',
    icon: Soup,
    featured: ['Cốt Lẩu Tom Yum', 'Lá Chanh Kaffir', 'Sốt Ớt Chua Nọt'],
  },
];

export default function AllCategoriesPage() {
  const [displayedCount, setDisplayedCount] = useState(6);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const visibleCategories = allCategories.slice(0, displayedCount);
  const hasMore = displayedCount < allCategories.length;

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(allCategories.length, prev + 3));
            setIsFetchingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedCount, hasMore, isFetchingMore]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-10 min-h-[75vh]">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">Tất cả danh mục</span>
      </nav>

      {/* Header Banner */}
      <div className="space-y-2 pb-6 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Tất cả danh mục sản phẩm Thái Lan
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
          Khám phá trọn bộ các ngành hàng đồ ăn vặt, snack và nước giải khát nhập khẩu chính ngạch trực tiếp từ Thái Lan (Hiển thị {visibleCategories.length} / {allCategories.length} danh mục).
        </p>
      </div>

      {/* All Categories Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {visibleCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200/90 hover:border-amber-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden h-full p-6 space-y-5"
                >
                  <div className="space-y-4">
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-[#F5C542] transition-colors shadow-xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg">
                        {cat.count}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h2 className="text-lg font-bold text-zinc-900 group-hover:text-amber-900 transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Featured Tag List */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.featured.map((item, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-medium rounded-md">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom CTA Action */}
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-amber-700 transition-colors">
                    <span>Khám phá danh mục</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Sentinel & Infinite Scroll Loader */}
      <div ref={observerTarget} className="py-8 flex flex-col items-center justify-center">
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#F5C542]" /> Đang tải thêm danh mục...
          </div>
        )}

        {!hasMore && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã hiển thị toàn bộ {allCategories.length} danh mục ngành hàng Thái Lan</span>
          </div>
        )}
      </div>

    </div>
  );
}
