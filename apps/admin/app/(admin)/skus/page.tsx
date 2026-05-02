import React from 'react';
import SkusView from '@/features/skus/components/SkusView';
import { PageResponse } from '@/types/pagination';
import { Sku } from '@/features/skus/types/sku.interface';

export default async function SkusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Dữ liệu mẫu (Mock Data)
  const sampleSkus: Sku[] = [
    {
      id: '1',
      sku: 'IP15PM-TITAN-128',
      productId: '1',
      productName: 'iPhone 15 Pro Max',
      price: 34990000,
      stock: 20,
      attributes: { 'Màu sắc': 'Titan', 'Dung lượng': '128GB' },
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      sku: 'IP15PM-TITAN-256',
      productId: '1',
      productName: 'iPhone 15 Pro Max',
      price: 38990000,
      stock: 15,
      attributes: { 'Màu sắc': 'Titan', 'Dung lượng': '256GB' },
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      sku: 'MBP14-M3-SILVER',
      productId: '2',
      productName: 'MacBook Pro 14 M3',
      price: 45990000,
      stock: 5,
      attributes: { 'Màu sắc': 'Silver', 'Chip': 'M3' },
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const skusResponse: PageResponse<Sku> = {
    success: true,
    data: sampleSkus,
    pagination: {
      currentPage: 0,
      totalPages: 1,
      totalElements: sampleSkus.length,
      pageSize: 10,
      last: true,
      first: true,
    }
  };

  return <SkusView initialData={skusResponse} />;
}
