'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { ChevronRight, Filter, Loader2, CheckCircle2 } from 'lucide-react';

const allProducts: Product[] = [
  {
    id: 'p1',
    name: 'Snack Mực Bento Thái Lan Cay Giòn Đậm Đà 20g',
    slug: 'snack-muc-bento-thai-lan',
    description: 'Vị mực nướng giòn rụm tẩm vị cay nồng chuẩn Thái.',
    price: 25000,
    originalPrice: 35000,
    discountPercent: 28,
    rating: 4.9,
    reviewCount: 342,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    isNew: true,
    isFeatured: true,
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Trà Sữa Thái Đỏ ChaTraMue Nguyên Chất Lon 330ml',
    slug: 'tra-sua-thai-do-chatramue',
    description: 'Hương vị trà thơm lừng kết hợp sữa béo ngậy chuẩn gốc Băng Cốc.',
    price: 45000,
    originalPrice: 55000,
    discountPercent: 18,
    rating: 4.8,
    reviewCount: 215,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    isFeatured: true,
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Bánh Pocky Chuối Thái Lan Hộp 25g',
    slug: 'banh-pocky-chuoi-thai-lan',
    description: 'Que bánh nướng giòn thơm lừng phủ lớp kem chuối ngọt dịu.',
    price: 18000,
    originalPrice: 25000,
    discountPercent: 28,
    rating: 4.7,
    reviewCount: 180,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    isNew: true,
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Mì Tôm Chua Cay Tom Yum Goong Mama Thái Lan Gói 90g',
    slug: 'mi-tom-chua-cay-tom-yum-mama',
    description: 'Nước dùng chua cay sảng khoái kết hợp sợi mì dai ngon.',
    price: 12000,
    originalPrice: 15000,
    discountPercent: 20,
    rating: 5.0,
    reviewCount: 520,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    isFeatured: true,
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Sầu Riêng Sấy Thăng Hoa Monthong Thái Lan 100g',
    slug: 'sau-rieng-say-thang-hoa-monthong',
    description: 'Miếng sầu riêng giòn tan, béo ngậy thơm lừng nguyên chất.',
    price: 150000,
    originalPrice: 180000,
    discountPercent: 16,
    rating: 5.0,
    reviewCount: 195,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    isFeatured: true,
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Kẹo Ngậm Xi Muội Play More Thái Lan Hủ 22g',
    slug: 'keo-ngam-playmore-xi-muoi',
    description: 'Hương vị thơm mát sảng khoái, lưu hương lâu.',
    price: 15000,
    originalPrice: 20000,
    discountPercent: 25,
    rating: 4.9,
    reviewCount: 410,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    isNew: true,
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Bánh Dừa Sấy Giòn Crispy Coconut Thái Lan 40g',
    slug: 'banh-dua-say-giron-crispy-coconut',
    description: 'Dừa nướng thơm béo giòn rụm đậm vị nhiệt đới.',
    price: 35000,
    originalPrice: 45000,
    discountPercent: 22,
    rating: 4.8,
    reviewCount: 140,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Snack Đậu Phộng Nước Cốt Dừa Koh-Kae Thái Lan 160g',
    slug: 'snack-dau-phong-koh-kae-nuoc-cot-dua',
    description: 'Vỏ bánh giòn rụm vị cốt dừa thơm béo bọc hạt đậu phộng bùi ngậy.',
    price: 42000,
    originalPrice: 50000,
    discountPercent: 16,
    rating: 4.9,
    reviewCount: 230,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    inStock: true,
  },
  {
    id: 'p9',
    name: 'Bánh Bông Lan Trứng Muối Euro Cake Thái Lan Hộp 144g',
    slug: 'banh-bong-lan-euro-cake-thai-lan',
    description: 'Cốt bánh mềm mịn nhân kem trứng muối dẻo thơm hấp dẫn.',
    price: 55000,
    originalPrice: 65000,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 175,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    inStock: true,
  },
  {
    id: 'p10',
    name: 'Trà Sữa Thái Xanh ChaTraMue Lon 330ml',
    slug: 'tra-sua-thai-xanh-chatramue',
    description: 'Trà xanh nhài đậm vị kết hợp sữa tươi thơm béo mát lạnh.',
    price: 45000,
    originalPrice: 55000,
    discountPercent: 18,
    rating: 4.9,
    reviewCount: 310,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    inStock: true,
  },
  {
    id: 'p11',
    name: 'Snack Mực Bento Siêu Cay Thái Lan 20g (Gói Cam)',
    slug: 'snack-muc-bento-sieu-cay-orange',
    description: 'Vị mực nướng ớt siêu cay thử thách độ chịu cay bùng nổ.',
    price: 25000,
    originalPrice: 35000,
    discountPercent: 28,
    rating: 5.0,
    reviewCount: 480,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    inStock: true,
  },
  {
    id: 'p12',
    name: 'Xoài Sấy Dẻo Hoàng Gia Thái Lan Hộp 150g',
    slug: 'xoai-say-deo-hoang-gia-thai-lan',
    description: 'Xoài chín cây sấy dẻo tự nhiên dẻo thơm ngọt thanh.',
    price: 68000,
    originalPrice: 85000,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 265,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    inStock: true,
  },
  {
    id: 'p13',
    name: 'Kẹo Dẻo Trái Cây Vị Dưa Hấu Play More Thái Lan 48g',
    slug: 'keo-deo-dua-hau-playmore-thai-lan',
    description: 'Viên kẹo dẻo thơm lừng vị dưa hấu thanh mát vui miệng.',
    price: 28000,
    originalPrice: 35000,
    discountPercent: 20,
    rating: 4.7,
    reviewCount: 190,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    inStock: true,
  },
  {
    id: 'p14',
    name: 'Nước Trà Chanh Thái Xanh Pokka Lon 300ml',
    slug: 'nuoc-tra-chanh-thai-xanh-pokka',
    description: 'Giải khát thanh mát đập tan cơn khát ngày hè bùng nổ.',
    price: 20000,
    originalPrice: 26000,
    discountPercent: 23,
    rating: 4.6,
    reviewCount: 112,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    inStock: true,
  },
  {
    id: 'p15',
    name: 'Mì Xào Chua Cay Tom Yum Mama Khô Gói 85g',
    slug: 'mi-xao-chua-cay-tom-yum-mama-kho',
    description: 'Sợi mì trộn dai ngon thấm đượm sốt Tom Yum cay chua đậm đà.',
    price: 14000,
    originalPrice: 18000,
    discountPercent: 22,
    rating: 4.9,
    reviewCount: 380,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    inStock: true,
  },
  {
    id: 'p16',
    name: 'Bánh Quy Chấm Kem Chocolate Choki Choki Thái 30g',
    slug: 'banh-quy-cham-chocolate-choki-choki',
    description: 'Bánh que giòn rụm chấm kem socola béo ngọt ngào.',
    price: 16000,
    originalPrice: 22000,
    discountPercent: 27,
    rating: 4.8,
    reviewCount: 155,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    inStock: true,
  },
];

const categoryList = [
  'Tất cả',
  'Snack & Bánh kẹo',
  'Nước giải khát',
  'Đồ ăn vặt',
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [displayedCount, setDisplayedCount] = useState(8);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredProducts = selectedCategory === 'Tất cả'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8 min-h-[75vh]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">Tất cả sản phẩm</span>
      </nav>

      {/* Title & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Tất cả sản phẩm Thái Lan
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Hiển thị {visibleProducts.length} / {filteredProducts.length} sản phẩm (Cuộn xuống để tải thêm)
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 mr-1" />
          {categoryList.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1E1B18] text-[#F5C542] border-[#1E1B18] shadow-xs font-bold'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
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

      {/* Bottom Sentinel & Infinite Scroll Loader */}
      <div ref={observerTarget} className="py-8 flex flex-col items-center justify-center">
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#F5C542]" /> Đang tải thêm sản phẩm...
          </div>
        )}

        {!hasMore && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-100 px-4 py-2 rounded-xl border border-zinc-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã hiển thị toàn bộ {filteredProducts.length} sản phẩm</span>
          </div>
        )}
      </div>

    </div>
  );
}
