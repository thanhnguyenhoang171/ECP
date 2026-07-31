'use client';

import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import BrandForm from '@/features/brands/components/BrandForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { brandApi } from '@/features/brands/api/brand.api';
import { Brand } from '@/features/brands/types/brand.interface';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      brandApi
        .getById(id)
        .then((data) => {
          setBrand(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const breadcrumbItems = [
    { label: 'Thương hiệu', href: '/brands', icon: Tag },
    { label: brand ? `Chỉnh sửa: ${brand.name}` : 'Chỉnh sửa thương hiệu' },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Đang tải thông tin thương hiệu...
      </div>
    );
  }

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
        onSuccess={() => {
          router.push('/brands');
          router.refresh();
        }}
      />
    </div>
  );
}

