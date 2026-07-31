'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/mockProducts';

export default function CategoryGrid() {
  return (
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
          className="flex items-center gap-1 text-zinc-900 font-semibold text-xs hover:text-amber-600 transition-colors cursor-pointer"
        >
          Xem tất cả danh mục <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat, idx) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={idx}
              href={`/categories/${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-zinc-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-[#F5C542] text-zinc-900 flex items-center justify-center transition-colors mb-4 shadow-xs">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-sm group-hover:text-amber-800 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">{cat.count}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
