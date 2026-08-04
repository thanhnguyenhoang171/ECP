'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export default function Banner() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
      
      {/* Editorial Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Main Hero Card (2 Cols wide) */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#FFFBEB] via-[#FFF8E1] to-[#FEF3C7] text-zinc-900 rounded-2xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border border-amber-200/90 shadow-sm"
        >
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            <div className="space-y-4 max-w-lg">
              <span className="inline-block px-3 py-1 bg-[#F5C542]/30 text-amber-900 text-xs font-bold rounded-full border border-[#F5C542]/50">
                Snack Thái Lan Nhập Khẩu 2026
              </span>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
                Snack Mực Bento Thái Lan Cay Giòn Rụm
              </h1>

              <p className="text-sm text-zinc-700 font-normal leading-relaxed">
                Thưởng thức hương vị mực nướng Bento chuẩn vị Thái, cay nồng đậm đà giòn tan từng miếng. Chuẩn hàng chính hãng nhập khẩu trực tiếp.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/products/snack-muc-bento-thai-lan"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border border-amber-500/20"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F5C542]" />
                    <span className="text-[#F5C542] font-bold">Thưởng thức ngay</span>
                  </Link>
                </motion.div>
                <span className="text-xs text-zinc-800 font-semibold font-mono pl-2">Chỉ từ 25.000đ</span>
              </div>
            </div>

            {/* Featured Bento Image */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-300/60 bg-white/40 p-2">
              <Image
                src="/tmp/bento.webp"
                alt="Snack Mực Bento Thái Lan"
                fill
                sizes="(max-width: 768px) 192px, 224px"
                className="object-cover rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Minimalist Graphic Element */}
          <div className="mt-8 pt-8 border-t border-amber-200/70 grid grid-cols-3 gap-4 text-xs text-zinc-700 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Giao hàng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
              <span>100% Nhập khẩu chính hãng</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Đổi trả nếu hết hạn</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column (Stacked 2 Cards) */}
        <div className="flex flex-col gap-4">
          
          {/* Top Card */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[#FFFBEB] via-[#FAF6ED] to-[#FFF3DC] rounded-2xl p-6 border border-amber-200/80 flex flex-col justify-between flex-1 hover:border-amber-300 transition-all shadow-xs"
          >
            <div>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Nước Giải Khát
              </span>
              <h3 className="text-lg font-semibold text-zinc-900 mt-1">
                Trà Sữa Thái Đỏ ChaTraMue
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Hương vị trà sữa thơm béo chuẩn vị Băng Cốc.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">45.000đ</span>
              <Link
                href="/products/tra-sua-thai-do-chatramue"
                className="p-2.5 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] rounded-xl transition-all font-bold shadow-sm border border-amber-500/20"
                title="Xem chi tiết"
              >
                <ArrowUpRight className="w-4 h-4 text-[#F5C542]" />
              </Link>
            </div>
          </motion.div>

          {/* Bottom Card */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-amber-100/70 via-yellow-100/40 to-amber-50 rounded-2xl p-6 border border-amber-200/90 text-zinc-900 flex flex-col justify-between flex-1 hover:border-amber-300 transition-all shadow-xs"
          >
            <div>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Bánh Kẹo Hot Hit
              </span>
              <h3 className="text-lg font-semibold text-zinc-900 mt-1">
                Bánh Pocky Chuối Thái Lan
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Giòn rụm thơm lừng vị chuối béo ngậy độc đáo.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900">18.000đ</span>
              <Link
                href="/products/banh-pocky-chuoi-thai-lan"
                className="p-2.5 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] rounded-xl transition-all font-bold shadow-sm border border-amber-500/20"
                title="Xem chi tiết"
              >
                <ArrowUpRight className="w-4 h-4 text-[#F5C542]" />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
