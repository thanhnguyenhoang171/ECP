'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export default function Banner() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6">
      
      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Main Hero Card (2 Cols wide) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden shadow-xs border border-slate-800">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div className="space-y-4 max-w-lg">
              <span className="inline-block px-3 py-1 bg-blue-900/60 text-blue-300 text-[11px] font-medium rounded-full border border-blue-700/60">
                Snack Thái Lan Nhập Khẩu Chính Hãng
              </span>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Snack Mực Bento Thái Lan Cay Giòn Rụm
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Thưởng thức hương vị mực nướng Bento chuẩn vị Thái, cay nồng đậm đà giòn tan từng miếng. Nhập khẩu trực tiếp bảo đảm chất lượng.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/products/snack-muc-bento-thai-lan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Thưởng thức ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
                <span className="text-xs text-slate-300 font-medium">Giá chỉ từ <strong className="text-white font-bold">25.000đ</strong></span>
              </div>
            </div>

            {/* Featured Bento Image */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden bg-slate-800/80 p-2 border border-slate-700/60 shadow-lg">
              <Image
                src="/tmp/bento.webp"
                alt="Snack Mực Bento Thái Lan"
                fill
                sizes="(max-width: 768px) 192px, 224px"
                className="object-cover rounded-xl hover:scale-103 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Guarantee Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-normal">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Giao hàng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>100% Chính hãng nhập khẩu</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Đổi trả uy tín</span>
            </div>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="flex flex-col gap-5">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 flex flex-col justify-between flex-1 transition-all shadow-2xs">
            <div>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Nước Giải Khát
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-1">
                Trà Sữa Thái Đỏ ChaTraMue
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hương vị trà sữa thơm béo chuẩn vị Băng Cốc.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">45.000đ</span>
              <Link
                href="/products/tra-sua-thai-do-chatramue"
                className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-900 hover:text-blue-600 rounded-lg transition-all font-medium text-xs border border-slate-200 hover:border-blue-200"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 flex flex-col justify-between flex-1 transition-all shadow-2xs">
            <div>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Bánh Kẹo Nổi Bật
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-1">
                Bánh Pocky Chuối Thái Lan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Giòn rụm thơm lừng vị chuối béo ngậy độc đáo.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">18.000đ</span>
              <Link
                href="/products/banh-pocky-chuoi-thai-lan"
                className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-900 hover:text-blue-600 rounded-lg transition-all font-medium text-xs border border-slate-200 hover:border-blue-200"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
