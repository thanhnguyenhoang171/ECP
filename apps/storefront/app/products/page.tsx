import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCatalogClient from '@/components/product/ProductCatalogClient';
import { getProductsServer } from '@/services/server/product.server';

export const revalidate = 60; // ISR 60 seconds

export default async function ProductsPage() {
  const initialProducts = await getProductsServer();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8 min-h-[75vh]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 font-semibold">Tất cả sản phẩm</span>
      </nav>

      {/* Interactive Catalog Container */}
      <ProductCatalogClient initialProducts={initialProducts} />
    </div>
  );
}
