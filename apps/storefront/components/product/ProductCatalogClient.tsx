'use client';

import React, { useState } from 'react';
import ProductGrid from './ProductGrid';
import { Product } from '@/types/product';

interface ProductCatalogClientProps {
  initialProducts: Product[];
  initialSearch?: string;
  initialCollection?: string;
}

export default function ProductCatalogClient({ initialProducts, initialSearch = '', initialCollection = '' }: ProductCatalogClientProps): React.JSX.Element {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('default');
  const [collection, setCollection] = useState(initialCollection);
  const [limit, setLimit] = useState(16);
  const categories = [...new Set(initialProducts.map((product) => product.category))];
  const filtered = initialProducts.filter((product) => (collection === 'new' ? product.isNew : collection === 'featured' ? product.isFeatured : collection === 'best-seller' ? product.isBestSeller : true) && (!category || product.category === category)
    && `${product.name} ${product.brand || ''}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  if (sort === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'popular') filtered.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 border-b border-slate-200 pb-4'>
        <h1 className='text-2xl font-bold'>Sản phẩm</h1>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <input type='search' aria-label='Tìm sản phẩm' placeholder='Tìm tên sản phẩm hoặc thương hiệu...'
            value={search} onChange={(event) => { setSearch(event.target.value); setLimit(16); }}
            className='min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm' />
          <select aria-label='Danh mục sản phẩm' value={category} onChange={(event) => { setCategory(event.target.value); setLimit(16); }} className='rounded-xl border border-slate-200 bg-white p-3 text-sm'>
            <option value=''>Tất cả danh mục</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select aria-label='Nhóm sản phẩm' value={collection} onChange={(event) => { setCollection(event.target.value); setLimit(16); }} className='rounded-xl border border-slate-200 bg-white p-3 text-sm'>
            <option value=''>Tất cả sản phẩm</option><option value='new'>Sản phẩm mới</option><option value='featured'>Nổi bật</option><option value='best-seller'>Bán chạy</option>
          </select>
          <select aria-label='Sắp xếp sản phẩm' value={sort} onChange={(event) => { setSort(event.target.value); setLimit(16); }} className='rounded-xl border border-slate-200 bg-white p-3 text-sm'>
            <option value='default'>Mới nhất</option>
            <option value='popular'>Bán nhiều nhất</option>
            <option value='priceAsc'>Giá tăng dần</option>
            <option value='priceDesc'>Giá giảm dần</option>
          </select>
        </div>
        <p className='text-xs text-slate-500'>{filtered.length} sản phẩm</p>
      </div>
      <ProductGrid products={filtered.slice(0, limit)} />
      {limit < filtered.length && <button type='button' onClick={() => setLimit((value) => value + 16)} className='block mx-auto rounded-xl border px-5 py-2 text-sm'>Xem thêm sản phẩm</button>}
    </div>
  );
}
