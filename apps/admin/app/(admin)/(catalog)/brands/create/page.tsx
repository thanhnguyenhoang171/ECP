'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BrandForm from '@/features/brands/components/BrandForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';

export default function CreateBrandPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Thương hiệu', href: '/brands', icon: Tag },
    { label: 'Thêm thương hiệu mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Thêm thương hiệu mới"
        description="Điền thông tin chi tiết để tạo thương hiệu sản phẩm mới trong hệ thống."
      />

      <BrandForm
        onSuccess={() => {
          router.push('/brands');
          router.refresh();
        }}
      />
    </div>
  );
}

