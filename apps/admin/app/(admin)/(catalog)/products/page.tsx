import React from 'react';
import ProductView from '@/features/products/components/ProductView';
import { PageResponse } from '@/types/pagination';
import { Product } from '@/features/products/types/product.interface';

interface ProductPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({
  searchParams,
}: ProductPageProps): Promise<React.ReactElement> {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const size = typeof resolvedParams.size === 'string' ? parseInt(resolvedParams.size, 10) : 10;

  const initialProductsResponse: PageResponse<Product> = {
    success: true,
    data: [],
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalElements: 0,
      pageSize: size,
      last: true,
      first: true,
    },
  };

  return (
    <ProductView 
      initialData={initialProductsResponse} 
      categories={[]} 
    />
  );
}

