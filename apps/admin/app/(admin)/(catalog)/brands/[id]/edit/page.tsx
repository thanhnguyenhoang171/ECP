'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import BrandForm from '@/features/brands/components/BrandForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { useBrand } from '@/features/brands/hooks/use-brands';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: brand, isLoading } = useBrand(id);

  const breadcrumbItems = [
    { label: 'Thương hiệu', href: '/brands', icon: Tag },
    { label: brand ? `Chỉnh sửa: ${brand.name}` : 'Chỉnh sửa thương hiệu' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Chỉnh sửa thương hiệu"
        description="Cập nhật thông tin mô tả, logo hoặc trạng thái của thương hiệu."
      />

      <BrandForm
        id={id}
        initialData={brand}
        isLoadingData={isLoading && !brand}
        onSuccess={() => {
          router.push('/brands');
          router.refresh();
        }}
      />
    </div>
  );
}

