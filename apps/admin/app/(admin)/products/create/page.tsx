'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/features/products/components/ProductForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Sản phẩm', href: '/products', icon: Package },
    { label: 'Thêm sản phẩm mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Thêm sản phẩm mới" 
        description="Điền thông tin chi tiết để tạo sản phẩm và các biến thể kho hàng."
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
        <ProductForm onSuccess={() => {
          toast.success('Tạo sản phẩm mới thành công');
          router.push('/products');
          router.refresh();
        }} />
      </div>
    </div>
  );
}
