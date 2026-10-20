'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Globe,
  Edit,
  ArrowLeft,
  Calendar,
  FileText,
  Hash,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useBrand } from '../hooks/use-brands';
import { useUpdateBrand } from '../hooks/use-brand-mutation';
import { Breadcrumbs, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/formatters';

interface BrandDetailViewProps {
  id: string;
}

export function BrandDetailView({ id }: BrandDetailViewProps): React.JSX.Element {
  const router = useRouter();
  const { data: brand, isLoading, isError } = useBrand(id);
  const updateMutation = useUpdateBrand();

  const isLoadingData = isLoading && !brand;

  const breadcrumbItems = [
    { label: 'Thương hiệu', href: '/brands', icon: Tag },
    { label: brand ? brand.name : 'Chi tiết thương hiệu' },
  ];

  const handleToggleActive = (): void => {
    if (brand) {
      updateMutation.mutate({
        id: brand.id,
        values: { active: !brand.active },
      });
    }
  };

  if (isError || (!isLoading && !brand)) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl space-y-4">
          <Tag className="w-16 h-16 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy thương hiệu</h2>
          <p className="text-xs text-slate-500">Thương hiệu bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
          <Button onClick={() => router.push('/brands')} variant="outline" className="gap-2 font-bold text-xs rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách thương hiệu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50 duration-300">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={brand?.name || 'Chi tiết thương hiệu'}
        description={brand ? `Mã định danh: ${brand.slug}` : 'Thông tin chi tiết thương hiệu sản phẩm'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/brands')}
              className="gap-1.5 text-xs font-bold border-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Danh sách
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/products?brandId=${id}`)}
              disabled={isLoadingData}
              className="gap-1.5 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <Package className="w-4 h-4" /> Xem sản phẩm
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/brands/${id}/edit`)}
              disabled={isLoadingData}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4"
            >
              <Edit className="w-4 h-4" /> Chỉnh sửa
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Basic Information, Description & Linked Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" /> Thông tin thương hiệu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" /> Tên thương hiệu
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-40 rounded-md" />
                ) : (
                  <p className="text-sm font-bold text-slate-900">{brand?.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Đường dẫn (Slug)
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-6 w-32 rounded-md" />
                ) : (
                  <p className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    /{brand?.slug}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Website chính thức
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-48 rounded-md" />
                ) : brand?.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <span>{brand.website}</span>
                    <ExternalLink className="w-3 h-3 text-blue-500" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-500 italic">Chưa cập nhật website</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" /> ID Thương hiệu
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-36 rounded-md" />
                ) : (
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 w-fit">
                    {brand?.id}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500">Mô tả thương hiệu</span>
              {isLoadingData ? (
                <Skeleton className="h-20 w-full rounded-xl" />
              ) : (
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {brand?.description || 'Chưa có thông tin mô tả chi tiết cho thương hiệu này.'}
                </p>
              )}
            </div>
          </div>

          {/* Linked Products in Catalog */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" /> Sản phẩm liên kết trong danh mục
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quản lý tất cả sản phẩm, tồn kho và các biến thể SKU thuộc thương hiệu{' '}
              <strong className="text-slate-900">{brand?.name || 'này'}</strong> trong hệ thống.
            </p>
            <div className="pt-1">
              <Button
                onClick={() => router.push(`/products?brandId=${id}`)}
                variant="outline"
                className="gap-2 text-xs font-bold border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-xl"
              >
                <Package className="w-4 h-4 text-blue-600" /> Xem danh sách sản phẩm thuộc thương hiệu
              </Button>
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
                  <p className="font-semibold text-slate-800">{brand?.createdAt ? formatDate(brand.createdAt) : '---'}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-slate-500">Cập nhật lần cuối</span>
                {isLoadingData ? (
                  <Skeleton className="h-4 w-28 rounded-md" />
                ) : (
                  <p className="font-semibold text-slate-800">{brand?.updatedAt ? formatDate(brand.updatedAt) : '---'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logo & Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col items-center text-center">
            <h2 className="text-sm font-bold text-slate-900 w-full text-left border-b border-slate-100 pb-3">
              Logo thương hiệu
            </h2>

            {isLoadingData ? (
              <Skeleton className="w-36 h-36 rounded-2xl" />
            ) : (
              <>
                <div className="w-36 h-36 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden relative flex items-center justify-center p-3 shadow-2xs">
                  {brand?.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <Tag className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                {!brand?.logo && (
                  <span className="text-xs text-slate-500 italic">Chưa có logo</span>
                )}
              </>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Trạng thái hoạt động
              </h2>
              {brand && (
                <Badge
                  variant="outline"
                  className={
                    brand.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold px-2 py-0.5 text-[11px]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 font-bold px-2 py-0.5 text-[11px]'
                  }
                >
                  {brand.active ? 'Hoạt động' : 'Đã khóa'}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-700 font-medium">Bật / Tắt trạng thái</span>
                <p className="text-[11px] text-slate-500">
                  {brand?.active ? 'Hiển thị trên toàn gian hàng' : 'Đang tạm dừng hiển thị'}
                </p>
              </div>
              {isLoadingData ? (
                <Skeleton className="h-6 w-11 rounded-full" />
              ) : (
                <Switch
                  checked={brand?.active ?? false}
                  onCheckedChange={handleToggleActive}
                  disabled={updateMutation.isPending}
                  className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                  aria-label="Chuyển đổi trạng thái thương hiệu"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
