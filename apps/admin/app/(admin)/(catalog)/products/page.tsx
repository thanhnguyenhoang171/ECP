import React from 'react';
import ProductView from '@/features/products/components/ProductView';
import { PageResponse } from '@/types/pagination';
import { Product } from '@/features/products/types/product.interface';

export default async function ProductPage({
  _searchParams,
}: {
  _searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const productsResponse: PageResponse<Product> = {
    success: true,
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalElements: 0,
      pageSize: 10,
      last: true,
      first: true,
    }
  };

  return (
    <ProductView 
      initialData={productsResponse} 
      categories={[]} 
    />
  );
}
