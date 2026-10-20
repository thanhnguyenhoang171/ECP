'use client';

import React, { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { Product } from '@/types/product';

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'isFeatured', label: 'Nổi bật' },
  { id: 'isNew', label: 'Mới nhất' },
  { id: 'isBestSeller', label: 'Bán chạy' },
] as const;

export default function TodaySuggestions({ products }: { products: Product[] }): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('all');
  const [limit, setLimit] = useState(16);
  const filtered = activeTab === 'all' ? products : products.filter((product) => product[activeTab]);
  return (
    <section className='max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <h2 className='text-xl font-bold'>Gợi ý hôm nay</h2>
        <div className='flex flex-wrap gap-2'>
          {tabs.map((tab) => (
            <button key={tab.id} type='button' aria-pressed={activeTab === tab.id}
              onClick={() => { setActiveTab(tab.id); setLimit(16); }}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ProductGrid products={filtered.slice(0, limit)} />
      {filtered.length > limit && (
        <button type='button' onClick={() => setLimit((value) => value + 16)} className='block mx-auto rounded-xl border px-5 py-2 text-sm'>Xem thêm sản phẩm</button>
      )}
    </section>
  );
}
