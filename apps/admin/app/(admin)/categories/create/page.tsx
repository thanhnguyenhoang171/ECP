'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoryForm from '@/features/categories/components/CategoryForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';
import { useParentCategories } from '@/features/categories/hooks/use-categories';

export default function CreateCategoryPage() {
  const router = useRouter();
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        <CategoryForm 
          parentCategories={parentCategories || []}
          onSuccess={() => {
            toast.success('Tạo danh mục mới thành công');
            router.push('/categories');
            router.refresh();
          }} 
        />
      </div>
    </div>
  );
}
