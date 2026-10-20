'use client';

import React, { Suspense } from 'react';
import { Layers } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoryForm from '@/features/categories/components/CategoryForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { useParentCategories } from '@/features/categories/hooks/use-categories';

function CreateCategoryFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentIdParam = searchParams.get('parentId') || '';
  const { data: parentCategories } = useParentCategories();

  const breadcrumbItems = [
    { label: 'Danh mục', href: '/categories', icon: Layers },
    { label: 'Tạo danh mục mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Tạo danh mục mới" 
        description="Nhập thông tin để thêm một danh mục sản phẩm vào hệ thống."
      />

      <CategoryForm 
        onCancel={() => router.push('/categories')}
        parentCategories={parentCategories || []}
        initialData={parentIdParam ? { parentId: parentIdParam } : undefined}
        isParentLocked={!!parentIdParam}
        onSuccess={() => {
          router.push('/categories');
          router.refresh();
        }} 
      />
    </div>
  );
}

export default function CreateCategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Đang tải biểu mẫu...</div>}>
      <CreateCategoryFormWrapper />
    </Suspense>
  );
}
