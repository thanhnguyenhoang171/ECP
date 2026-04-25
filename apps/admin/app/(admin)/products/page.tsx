import React from 'react';
import ProductView from '@/features/products/components/ProductView';

export default async function ProductPage() {
  // Ở đây bạn có thể fetch data từ database hoặc API
  // Tạm thời sử dụng dữ liệu tĩnh (giả lập server data)
  const initialProducts = [
    {
      id: 'PROD-001',
      name: 'iPhone 15 Pro Max',
      category: 'Điện thoại',
      price: '34,990,000 đ',
      stock: 45,
      status: 'In Stock',
    },
    {
      id: 'PROD-002',
      name: 'MacBook Pro M3',
      category: 'Laptop',
      price: '45,990,000 đ',
      stock: 12,
      status: 'Low Stock',
    },
    {
      id: 'PROD-003',
      name: 'AirPods Pro 2',
      category: 'Phụ kiện',
      price: '5,990,000 đ',
      stock: 0,
      status: 'Out of Stock',
    },
    {
      id: 'PROD-004',
      name: 'iPad Pro M2',
      category: 'Máy tính bảng',
      price: '22,990,000 đ',
      stock: 28,
      status: 'In Stock',
    },
  ];

  return <ProductView initialProducts={initialProducts} />;
}
