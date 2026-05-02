import React from 'react';
import ProductView from '@/features/products/components/ProductView';
import { PageResponse } from '@/types/pagination';
import { Product } from '@/features/products/types/product.interface';

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Dữ liệu mẫu (Mock Data)
  const sampleProducts: Product[] = [
    {
      id: '1',
      sku: 'IP15PM-TITAN',
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      brand: 'Apple',
      categoryId: 'cat-1',
      categoryName: 'Điện thoại',
      price: 34990000,
      stock: 50,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      sku: 'MBP14-M3',
      name: 'MacBook Pro 14 M3',
      slug: 'macbook-pro-14-m3',
      brand: 'Apple',
      categoryId: 'cat-2',
      categoryName: 'Laptop',
      price: 45990000,
      stock: 15,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      sku: 'S24-ULTRA',
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-s24-ultra',
      brand: 'Samsung',
      categoryId: 'cat-1',
      categoryName: 'Điện thoại',
      price: 29990000,
      stock: 30,
      isPublished: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const productsResponse: PageResponse<Product> = {
    success: true,
    data: sampleProducts,
    pagination: {
      currentPage: 0,
      totalPages: 1,
      totalElements: sampleProducts.length,
      pageSize: 10,
      last: true,
      first: true,
    }
  };

  const sampleCategories = [
    { id: 'cat-1', name: 'Điện thoại' },
    { id: 'cat-2', name: 'Laptop' },
    { id: 'cat-3', name: 'Phụ kiện' },
  ];

  return (
    <ProductView 
      initialData={productsResponse} 
      categories={sampleCategories as any} 
    />
  );
}
