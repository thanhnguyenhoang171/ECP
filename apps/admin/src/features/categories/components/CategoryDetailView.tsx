'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Edit,
  ArrowLeft,
  Calendar,
  FileText,
  Hash,
  CheckCircle2,
  XCircle,
  FolderTree,
  ListOrdered,
  Globe,
  Star,
} from 'lucide-react';
import { useCategory, useParentCategories } from '../hooks/use-categories';
import { Breadcrumbs, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/formatters';

interface CategoryDetailViewProps {
  readonly id: string;
}

export function CategoryDetailView({ id }: CategoryDetailViewProps): React.JSX.Element {
  const router = useRouter();
  const { data: category, isLoading, isError } = useCategory(id);
  const { data: parentCategories } = useParentCategories();

  const isLoadingData = isLoading && !category;
  const parentCategory = parentCategories?.find((c) => c.id === category?.parentId);

  const breadcrumbItems = [
    { label: 'Danh mục', href: '/categories', icon: Layers },
    { label: category ? category.name : 'Chi tiết danh mục' },
  ];

  if (isError || (!isLoading && !category)) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl space-y-4">
          <Layers className="w-16 h-16 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy danh mục</h2>
          <p className="text-xs text-slate-500">Danh mục bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
          <Button onClick={() => router.push('/categories')} variant="outline" className="gap-2 font-bold text-xs rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách danh mục
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50 duration-300">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={category?.name || 'Chi tiết danh mục'}
        description={category ? `Mã định danh: ${category.slug}` : 'Thông tin chi tiết danh mục sản phẩm'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/categories')}
              className="gap-1.5 text-xs font-bold border-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Danh sách
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/categories/${id}/edit`)}
              disabled={isLoadingData}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4"
            >
              <Edit className="w-4 h-4" /> Chỉnh sửa
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Basic Information, Description & SEO */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Thông tin danh mục
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Tên danh mục
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-40 rounded-md" />
                ) : (
                  <p className="text-sm font-bold text-slate-900">{category?.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Đường dẫn (Slug)
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-6 w-32 rounded-md" />
                ) : (
                  <p className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    /{category?.slug}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-slate-400" /> Danh mục cha
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-40 rounded-md" />
                ) : (
                  <p className="text-sm text-slate-800">
                    {parentCategory ? parentCategory.name : 'Không có (Danh mục gốc)'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-slate-400" /> Cấp độ danh mục
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-24 rounded-md" />
                ) : (
                  <Badge variant="outline" className="text-xs font-semibold bg-slate-50">
                    Cấp {category?.level ?? 1}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-slate-400" /> Thứ tự hiển thị
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-16 rounded-md" />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {category?.sortOrder ?? category?.order ?? 0}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> ID Danh mục
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-36 rounded-md" />
                ) : (
                  <p className="text-xs font-mono text-slate-600">{category?.id}</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500">Mô tả danh mục</span>
              {isLoadingData ? (
                <Skeleton className="h-20 w-full rounded-xl" />
              ) : (
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {category?.description || 'Chưa có thông tin mô tả chi tiết cho danh mục này.'}
                </p>
              )}
            </div>
          </div>

          {/* SEO Configuration Section */}
          {(category?.metaTitle || category?.metaKeywords || category?.metaDescription) && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Cấu hình SEO
              </h2>

              <div className="space-y-4 text-xs">
                {category.metaTitle && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500">Meta Title</span>
                    <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {category.metaTitle}
                    </p>
                  </div>
                )}

                {category.metaKeywords && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500">Meta Keywords</span>
                    <p className="font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {category.metaKeywords}
                    </p>
                  </div>
                )}

                {category.metaDescription && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500">Meta Description</span>
                    <p className="leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {category.metaDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Image, Status & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Image */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col items-center text-center">
            <h2 className="text-sm font-bold text-slate-900 w-full text-left border-b border-slate-100 pb-3">
              Hình ảnh danh mục
            </h2>

            {isLoadingData ? (
              <Skeleton className="w-36 h-36 rounded-2xl" />
            ) : (
              <>
                <div className="w-36 h-36 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden relative flex items-center justify-center p-2 shadow-2xs">
                  {category?.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover rounded-xl"
                      unoptimized
                    />
                  ) : (
                    <Layers className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                {!category?.imageUrl && (
                  <span className="text-xs text-slate-400 italic">Chưa có ảnh danh mục</span>
                )}
              </>
            )}
          </div>

          {/* Status & Featured Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Trạng thái & Hiển thị
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Trạng thái</span>
                {isLoadingData ? (
                  <Skeleton className="h-6 w-24 rounded-full" />
                ) : (
                  <Badge
                    className={
                      category?.active
                        ? 'bg-emerald-100 text-emerald-800 border-none font-bold px-3 py-1 text-xs'
                        : 'bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 text-xs'
                    }
                  >
                    {category?.active ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" /> Đã ẩn
                      </span>
                    )}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-600 font-medium">Nổi bật (Trang chủ)</span>
                {isLoadingData ? (
                  <Skeleton className="h-6 w-20 rounded-full" />
                ) : (
                  <Badge
                    variant={category?.isFeatured ? 'default' : 'secondary'}
                    className={
                      category?.isFeatured
                        ? 'bg-amber-100 text-amber-800 border-none font-bold px-3 py-1 text-xs'
                        : 'bg-slate-100 text-slate-500 border-none font-medium px-2.5 py-0.5 text-xs'
                    }
                  >
                    {category?.isFeatured ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Nổi bật
                      </span>
                    ) : (
                      'Bình thường'
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* System metadata */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" /> Thông tin hệ thống
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500">Ngày khởi tạo</span>
                {isLoadingData ? (
                  <Skeleton className="h-4 w-28 rounded-md" />
                ) : (
                  <p className="font-semibold text-slate-800">
                    {category?.createdAt ? formatDate(category.createdAt) : '---'}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Cập nhật lần cuối</span>
                {isLoadingData ? (
                  <Skeleton className="h-4 w-28 rounded-md" />
                ) : (
                  <p className="font-semibold text-slate-800">
                    {category?.updatedAt ? formatDate(category.updatedAt) : '---'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
