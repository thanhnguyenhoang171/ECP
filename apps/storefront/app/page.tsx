'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Banner from '@/components/home/Banner';
import ProductCard from '@/components/product/ProductCard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { Product } from '@/types/product';
import { 
  ArrowRight, 
  Coffee, 
  Cookie, 
  Utensils, 
  Flame, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  Gift, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const mockProducts: Product[] = [
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
];

// Danh sách 20 sản phẩm cho phần "Gợi ý hôm nay"
const todaySuggestions: (Product & { tag: 'hot' | 'spicy' | 'cool' | 'combo' })[] = [
  {
    id: 't1',
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
    tag: 'hot',
    isNew: true,
    inStock: true,
  },
  {
    id: 't2',
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
    tag: 'combo',
    isFeatured: true,
    inStock: true,
  },
  {
    id: 't3',
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
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't4',
    name: 'Nước Ép Trà Chanh Thảo Mộc Thái Lan Lon 320ml',
    slug: 'nuoc-ep-tra-chanh-thao-moc-thai',
    description: 'Giải nhiệt tức thì với vị chanh tươi mát kết hợp thảo mộc.',
    price: 22000,
    originalPrice: 30000,
    discountPercent: 26,
    rating: 4.7,
    reviewCount: 88,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    tag: 'cool',
    inStock: true,
  },
  {
    id: 't5',
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
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't6',
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
    tag: 'combo',
    inStock: true,
  },
  {
    id: 't7',
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
    tag: 'cool',
    inStock: true,
  },
  {
    id: 't8',
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
    tag: 'spicy',
    inStock: true,
  },
  {
    id: 't9',
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
    tag: 'combo',
    inStock: true,
  },
  {
    id: 't10',
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
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't11',
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
    tag: 'cool',
    inStock: true,
  },
  {
    id: 't12',
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
    tag: 'spicy',
    inStock: true,
  },
  {
    id: 't13',
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
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't14',
    name: 'Bánh Chuối Sấy Giòn Phủ Kem Dừa Thái Lan 80g',
    slug: 'banh-chuoi-say-giron-kem-dua',
    description: 'Chuối lát sấy giòn bùi kẹp lớp kem dừa béo béo thơm nức.',
    price: 48000,
    originalPrice: 60000,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 170,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    tag: 'combo',
    inStock: true,
  },
  {
    id: 't15',
    name: 'Snack Que Đậu Hà Lan Mix Vị Thái Lan 60g',
    slug: 'snack-que-dau-ha-lan-mix-thai-lan',
    description: 'Thanh bắp nướng giòn rụm tẩm vị đậu hà lan cay nhẹ.',
    price: 22000,
    originalPrice: 28000,
    discountPercent: 21,
    rating: 4.7,
    reviewCount: 130,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't16',
    name: 'Mực Cán Sấy Cay Đầm Đậm Bento Hũ 100g',
    slug: 'muc-can-say-cay-bento-hu-100g',
    description: 'Hũ mực cán sấy tẩm vị ớt cay nồng đậm đà giòn tan.',
    price: 125000,
    originalPrice: 150000,
    discountPercent: 17,
    rating: 5.0,
    reviewCount: 290,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    tag: 'spicy',
    inStock: true,
  },
  {
    id: 't17',
    name: 'Nước Dừa Tươi Nguyên Chất Koh Coconut Thailand 330ml',
    slug: 'nuoc-dua-tuoi-koh-coconut-thailand',
    description: 'Nước dừa tươi ngọt mát tự nhiên giàu khoáng chất.',
    price: 32000,
    originalPrice: 40000,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 145,
    images: ['/tmp/bento.webp'],
    category: 'Nước giải khát',
    tag: 'cool',
    inStock: true,
  },
  {
    id: 't18',
    name: 'Combo Ăn Vặt Thái Lan Đêm Khuya 5 Món Hot',
    slug: 'combo-an-vat-thai-lan-dem-khuya',
    description: 'Trọn bộ 5 món ăn vặt Bento, Pocky, Mama, Playmore, Trà sữa.',
    price: 135000,
    originalPrice: 175000,
    discountPercent: 23,
    rating: 5.0,
    reviewCount: 610,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    tag: 'combo',
    inStock: true,
  },
  {
    id: 't19',
    name: 'Snack Đậu Hà Lan Tẩm Muối Biển Thái Lan 120g',
    slug: 'snack-dau-ha-lan-tam-muoi-bien-thai',
    description: 'Hạt đậu hà lan sấy giòn rụm vị muối biển bùi thơm.',
    price: 38000,
    originalPrice: 48000,
    discountPercent: 21,
    rating: 4.7,
    reviewCount: 95,
    images: ['/tmp/bento.webp'],
    category: 'Snack & Bánh kẹo',
    tag: 'hot',
    inStock: true,
  },
  {
    id: 't20',
    name: 'Ớt Sấy Giòn Tẩm Vị Tom Yum Thái Lan 80g',
    slug: 'ot-say-giron-tam-vi-tom-yum-thai',
    description: 'Ớt sấy giòn tan tẩm vị chua cay Tom Yum kích thích cực mạnh.',
    price: 52000,
    originalPrice: 65000,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 220,
    images: ['/tmp/bento.webp'],
    category: 'Đồ ăn vặt',
    tag: 'spicy',
    inStock: true,
  },
];

const categories = [
  { name: 'Snack & Bánh kẹo Thái', icon: Cookie, count: '120+ loại snack', slug: 'snack-candies' },
  { name: 'Nước giải khát & Trà sữa', icon: Coffee, count: '85+ đồ uống', slug: 'beverages' },
  { name: 'Đồ ăn vặt & Mì ăn liền', icon: Utensils, count: '90+ sản phẩm', slug: 'instant-foods' },
  { name: 'Món Cay & Tom Yum', icon: Flame, count: '45+ gia vị & đồ khô', slug: 'spices-sauces' },
  { name: 'Trái cây sấy khô', icon: Sparkles, count: '60+ sản phẩm sấy', slug: 'dried-fruits' },
];

export default function Home() {
  const isLoading = false; // Mock loading state
  const [activeSuggestionTab, setActiveSuggestionTab] = useState<'all' | 'hot' | 'spicy' | 'cool' | 'combo'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; // 16 sản phẩm mỗi trang (4 cột x 4 hàng)

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

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
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <Banner />

      {/* Featured Categories - Bento Style */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
              Danh mục đồ ăn Thái nổi bật
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Khám phá thiên đường snack và đồ uống chính hiệu nhập khẩu từ Thái Lan
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-zinc-900 font-semibold text-xs hover:text-amber-600 transition-colors"
          >
            Xem tất cả danh mục <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                href={`/categories/${cat.slug}`}
                className="group p-4 bg-white rounded-xl border border-zinc-200/80 hover:border-zinc-400 transition-all duration-200 flex flex-col items-start space-y-3 shadow-2xs"
              >
                <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 group-hover:bg-[#f5c542] group-hover:text-[#1e1b18] transition-colors shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    {cat.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION: Snack & Đồ uống bán chạy (Horizontal Scroll Slider) ─────── */}
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
            className="flex items-center gap-1 text-zinc-900 font-medium text-xs hover:text-zinc-600 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Slider Container with Visible Scrollbar */}
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

      {/* ─── SECTION: Gợi Ý Hôm Nay ────────────────────────────────────────── */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="p-6 sm:p-8 bg-[#f8f7f5] text-zinc-900 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Gợi ý hôm nay
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Khám phá các món ăn vặt & thức uống Thái Lan chuẩn vị được chọn lọc mỗi ngày
              </p>
            </div>

            {/* Filter Tabs using Lucide React icons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'Tất cả', icon: LayoutGrid },
                { id: 'hot', label: 'Hot Trend', icon: TrendingUp },
                { id: 'spicy', label: 'Món Siêu Cay', icon: Flame },
                { id: 'cool', label: 'Giải Nhiệt', icon: Coffee },
                { id: 'combo', label: 'Combo Tiết Kiệm', icon: Gift },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      activeSuggestionTab === tab.id
                        ? 'bg-[#1E1B18] text-[#F5C542] border-[#1E1B18] shadow-xs font-bold'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today Suggestions Grid: 4 Columns x 5 Rows (20 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="wait">
              {paginatedSuggestions.map((product) => (
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

          {/* Pagination Bar (First, Previous, Numbers, Next, Last) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200/80">
            <span className="text-xs text-zinc-500 font-medium">
              Hiển thị <span className="font-semibold text-zinc-900">{Math.min(filteredSuggestions.length, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="font-semibold text-zinc-900">{Math.min(filteredSuggestions.length, currentPage * itemsPerPage)}</span> trên tổng số <span className="font-semibold text-zinc-900">{filteredSuggestions.length}</span> gợi ý
            </span>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl text-xs border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl text-xs border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    currentPage === page
                      ? 'bg-[#1E1B18] text-[#F5C542] border-[#1E1B18] shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl text-xs border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl text-xs border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C542] hover:bg-[#E5B32E] text-zinc-900 font-bold text-xs rounded-lg transition-colors shrink-0 shadow-md"
          >
            <Tag className="w-3.5 h-3.5" /> Săn Combo ngay
          </Link>
        </div>
      </section>

    </div>
  );
}
