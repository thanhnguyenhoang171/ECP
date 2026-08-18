'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cookie } from 'lucide-react';
import { getCategoriesServer } from '@/services/category.service';
import { Category } from '@/types/product';

export default function CategoryGrid() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    getCategoriesServer().then(res => {
      if (res && res.length > 0) {
        setCategoryList(res);
      }
    });
  }, []);

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Danh mục sản phẩm Cacao & Socola nổi bật
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Khám phá nguồn hương vị cacao nguyên chất hảo hạng và socola craft tuyển chọn
          </p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors cursor-pointer"
        >
          <span>Xem tất cả</span> <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categoryList.map((cat, idx) => {
          const IconComponent = cat.icon || Cookie;
          return (
            <Link
              key={cat.id || idx}
              href={`/categories/${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-4 border border-blue-100/80 shadow-2xs">
                {typeof IconComponent === 'function' ? <IconComponent className="w-5 h-5" /> : <Cookie className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{cat.description || `${cat.itemCount || 10} sản phẩm`}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
