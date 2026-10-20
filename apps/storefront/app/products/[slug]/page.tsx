import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import { getProductBySlugServer, getProductsServer } from '@/services/server/product.server';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) notFound();
  const related = (await getProductsServer(product.categoryId)).filter((item) => item.id !== product.id).slice(0, 4);
  return <ProductDetailClient key={product.id} product={product} relatedProducts={related} />;
}
