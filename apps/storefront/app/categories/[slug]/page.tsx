'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { ChevronRight, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

const categoryMeta: Record<string, {
  name: string;
  description: string;
  countText: string;
}> = {
  'snack-candies': {
    name: 'Snack & Bánh kẹo Thái Lan',
    description: 'Thiên đường bánh kẹo và snack nhập khẩu chính hãng từ Thái Lan. Bento cay giòn, Pocky chuối thơm béo, kẹo ngậm Playmore mát lạnh.',
    countText: '120+ sản phẩm chính hãng',
  },
  'beverages': {
    name: 'Nước giải khát & Trà sữa Thái',
    description: 'Trải nghiệm trà sữa Thái đỏ ChaTraMue chuẩn gốc Băng Cốc, trà chanh thảo mộc và nước dừa tươi nguyên chất Koh Coconut.',
    countText: '85+ đồ uống mát lạnh',
  },
  'instant-foods': {
    name: 'Đồ ăn vặt & Mì ăn liền Thái',
    description: 'Tổng hợp các loại mì tôm chua cay Tom Yum Goong Mama, mì xào khô, cơm cháy & hải sản sấy cay chuẩn vị.',
    countText: '90+ sản phẩm ăn liền',
  },
  'spices-sauces': {
    name: 'Món Cay & Tom Yum',
    description: 'Bộ sưu tập snack cay xé lưỡi, ớt sấy giòn Tom Yum, sốt chấm và gia vị truyền thống Xứ sở Chùa Vàng.',
    countText: '45+ món cay độc đáo',
  },
  'dried-fruits': {
    name: 'Trái cây sấy khô Thái Lan',
    description: 'Sầu riêng sấy thăng hoa Monthong béo ngậy, xoài sấy dẻo hoàng gia, dừa nướng giòn rụm nguyên vị tự nhiên.',
    countText: '60+ trái cây sấy',
  },
};

const categoryProducts: Product[] = [
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
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const meta = categoryMeta[slug] || {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Khám phá các sản phẩm nhập khẩu Thái Lan chất lượng cao tại Cacao Thai Snack Shop.',
    countText: 'Nhiều sản phẩm hấp dẫn',
  };

  const [priceFilter, setPriceFilter] = useState<'all' | 'under30' | '30to100' | 'above100'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc'>('popular');

  let filtered = [...categoryProducts];

  if (priceFilter === 'under30') {
    filtered = filtered.filter(p => p.price < 30000);
  } else if (priceFilter === '30to100') {
    filtered = filtered.filter(p => p.price >= 30000 && p.price <= 100000);
  } else if (priceFilter === 'above100') {
    filtered = filtered.filter(p => p.price > 100000);
  }

  if (sortBy === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link href="/products" className="hover:text-zinc-900 transition-colors">Danh mục</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">{meta.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-yellow-50 text-zinc-900 border border-amber-200/90 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5C542]/30 text-amber-900 text-xs font-bold rounded-full border border-[#F5C542]/50">
            <Sparkles className="w-3.5 h-3.5" /> {meta.countText}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            {meta.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
            {meta.description}
          </p>
        </div>

        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-amber-300/60 bg-white/60 p-2">
          <Image
            src="/tmp/bento.webp"
            alt={meta.name}
            fill
            sizes="176px"
            className="object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        
        {/* Price Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: 'Tất cả giá' },
            { id: 'under30', label: 'Dưới 30k' },
            { id: '30to100', label: '30k - 100k' },
            { id: 'above100', label: 'Trên 100k' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPriceFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                priceFilter === item.id
                  ? 'bg-[#1e293b] text-[#F5C542] border-[#1e293b] shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 font-medium">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#F5C542] cursor-pointer shadow-2xs"
          >
            <option value="popular">Bán chạy nhất</option>
            <option value="priceAsc">Giá thấp đến cao</option>
            <option value="priceDesc">Giá cao đến thấp</option>
          </select>
        </div>

      </div>

      {/* Category Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}
