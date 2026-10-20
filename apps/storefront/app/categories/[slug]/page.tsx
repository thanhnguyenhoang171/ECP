import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCatalogClient from '@/components/product/ProductCatalogClient';
import { getCategoriesServer } from '@/services/server/category.server';
import { getProductsServer } from '@/services/server/product.server';

export const dynamic = 'force-dynamic';

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const { slug } = await params;
  const category = (await getCategoriesServer()).find((item) => item.slug === slug);
  if (!category) notFound();
  const products = await getProductsServer(category.id);
  return (
    <div className='max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6'>
      <nav className='text-sm text-slate-500'><Link href='/categories'>Danh mục</Link> / {category.name}</nav>
      <div><h1 className='text-2xl font-bold'>{category.name}</h1><p className='mt-2 text-sm text-slate-500'>{category.description}</p></div>
      <ProductCatalogClient initialProducts={products} />
    </div>
  );
}
