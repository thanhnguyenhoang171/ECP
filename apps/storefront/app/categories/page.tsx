import React from 'react';
import Link from 'next/link';
import { getCategoriesServer } from '@/services/server/category.server';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage(): Promise<React.JSX.Element> {
  const categories = await getCategoriesServer();
  return (
    <div className='max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6'>
      <h1 className='text-2xl font-bold'>Danh mục sản phẩm</h1>
      {categories.length ? <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className='rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-400 space-y-2'>
          <h2 className='font-bold'>{category.name}</h2>
          <p className='text-sm text-slate-500'>{category.description}</p>
          <span className='block text-sm text-blue-600'>Xem sản phẩm →</span>
        </Link>)}
      </div> : <p className='py-12 text-center text-slate-500'>Chưa có danh mục nào để hiển thị.</p>}
    </div>
  );
}
