'use client';

import React, { use } from 'react';
import { Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoryForm from '@/features/categories/components/CategoryForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';
import { useParentCategories, useCategory } from '@/features/categories/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: category, isLoading: isCategoryLoading } = useCategory(id);
  const { data: parentCategories } = useParentCategories();

  const breadcrumbItems = [
    { label: 'Danh mục', href: '/categories', icon: Layers },
    { label: 'Chỉnh sửa danh mục' },
  ];

  const isLoading = isCategoryLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Chỉnh sửa danh mục" 
        description="Cập nhật thông tin chi tiết của danh mục sản phẩm."
      />

      {isLoading ? (
        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-1/2" />
        </div>
      ) : category ? (
        <CategoryForm 
          id={id}
          initialData={{
            name: category.name,
            slug: category.slug,
            parentId: category.parentId || 'none',
            active: category.active,
            imageUrl: category.imageUrl,
            imagePublicId: category.imagePublicId,
            description: category.description || '',
            order: category.order || 0,
            metaTitle: category.metaTitle || '',
            metaDescription: category.metaDescription || '',
            metaKeywords: category.metaKeywords || '',
          }}
          parentCategories={parentCategories || []}
          onSuccess={() => {
            toast.success('Cập nhật danh mục thành công');
            router.push('/categories');
            router.refresh();
          }} 
        />
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          Không tìm thấy danh mục yêu cầu hoặc đã xảy ra lỗi khi tải dữ liệu.
        </div>
      )}
    </div>
  );
}
