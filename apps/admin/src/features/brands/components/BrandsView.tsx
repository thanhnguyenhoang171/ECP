'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Tag, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Badge,
  NextPagination,
  PageHeader,
  DataTable,
  type ColumnDef,
  Breadcrumbs,
  DataCard,
} from '@/components/common';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  SearchInput,
  ImportButton,
  ExportButton,
  AddNewButton,
  FilterPopover,
  SortPopover,
  ResetFiltersButton,
  EditActionButton,
  DeleteActionButton,
  ViewActionButton,
  DeleteConfirmDialog,
} from '@/components/common/view-control';
import { Label } from '@/components/ui/label';

import { Brand } from '../types/brand.interface';
import { PageResponse } from '@/types/pagination';
import { useBrands } from '../hooks/use-brands';
import { useDeleteBrand, useUpdateBrand } from '../hooks/use-brand-mutation';
import { isForbiddenError } from '@/constants/errorMessages';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { cn } from '@/lib/utils';
import { formatDateTimeForFilename } from '@/lib/formatters';
import { brandApi } from '../api/brand.api';
import { toast } from 'sonner';

interface BrandsViewProps {
  initialData?: PageResponse<Brand>;
}

export default function BrandsView({ initialData }: BrandsViewProps): React.JSX.Element {
  const router = useRouter();
  const deleteMutation = useDeleteBrand();
  const updateMutation = useUpdateBrand();

  const {
    sort,
    name,
    updateUrl,
    setSort,
    searchParams,
    page,
    size,
    setPage,
    setSize,
  } = useViewParams('createdAt,desc');

  const activeFilter = searchParams.get('active');

  const { data: queryData, isFetching, isLoading, error } = useBrands(
    {
      page,
      size,
      sort,
      name,
      active: activeFilter === null ? undefined : activeFilter === 'true',
    },
    initialData?.data?.length ? initialData : undefined,
  );

  const isForbidden = isForbiddenError(error);

  const pageData = queryData || initialData;
  const brands = pageData?.data || [];
  const totalPages = pageData?.pagination?.totalPages || 1;
  const totalElements = pageData?.pagination?.totalElements || 0;

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, (val) => updateUrl({ name: val, page: 1 }));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const blob = await brandApi.export();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      try {
        link.href = url;
        link.download = `thuong-hieu_${formatDateTimeForFilename()}.xlsx`;
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Brand export failed:', error);
      toast.error('Không thể xuất danh sách thương hiệu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreate = useCallback(() => {
    router.push('/brands/create');
  }, [router]);
  useHotkeys('+', handleCreate);

  const handleEdit = useCallback((brand: Brand) => {
    router.push(`/brands/${brand.id}/edit`);
  }, [router]);

  const handleViewDetail = useCallback((brand: Brand) => {
    router.push(`/brands/${brand.id}`);
  }, [router]);

  const handleToggleActive = useCallback((brand: Brand) => {
    updateMutation.mutate({
      id: brand.id,
      values: { active: !brand.active },
    });
  }, [updateMutation]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmId && !deleteMutation.isPending) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => setDeleteConfirmId(null),
      });
    }
  }, [deleteConfirmId, deleteMutation]);

  const brandToDelete = brands.find(b => b.id === deleteConfirmId);

  const sortOptions = useMemo(() => [
    { label: 'Tên (A-Z)', value: 'name,asc' },
    { label: 'Tên (Z-A)', value: 'name,desc' },
    { label: 'Mới nhất', value: 'createdAt,desc' },
    { label: 'Cũ nhất', value: 'createdAt,asc' },
  ], []);

  const columns: ColumnDef<Brand>[] = useMemo(() => [
    {
      header: 'Thương hiệu',
      className: 'w-[35%] min-w-[220px]',
      headerClassName: 'w-[35%] min-w-[220px]',
      skeleton: (
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ),
      cell: (brand) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center relative shadow-2xs">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Tag className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <Link
              href={`/brands/${brand.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 focus-visible:outline-none focus-visible:underline transition-colors"
            >
              {brand.name}
            </Link>
            <span className="text-[11px] font-mono text-slate-500 font-medium truncate">
              /{brand.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Mô tả',
      className: 'w-[25%] min-w-[160px] max-w-xs lg:max-w-md xl:max-w-lg text-xs text-slate-500 hidden md:table-cell',
      headerClassName: 'w-[25%] min-w-[160px] max-w-xs lg:max-w-md xl:max-w-lg hidden md:table-cell',
      skeleton: <Skeleton className="h-4 w-40 rounded-md" />,
      cell: (brand) => (
        <span
          className="block truncate max-w-xs lg:max-w-md xl:max-w-lg"
          title={brand.description || ''}
        >
          {brand.description || '---'}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      className: 'w-[20%] min-w-[140px]',
      headerClassName: 'w-[20%] min-w-[140px]',
      skeleton: <Skeleton className="h-6 w-24 mx-auto rounded-full" />,
      cell: (brand) => (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={brand.active}
            onCheckedChange={() => handleToggleActive(brand)}
            disabled={updateMutation.isPending || isFetching}
            className="scale-75 data-[state=checked]:bg-emerald-600 cursor-pointer"
            aria-label={brand.active ? `Khóa thương hiệu ${brand.name}` : `Kích hoạt thương hiệu ${brand.name}`}
          />
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-bold py-0.5 px-2 whitespace-nowrap transition-colors border',
              brand.active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            {brand.active ? 'Hoạt động' : 'Đã khóa'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right',
      className: 'w-[20%] min-w-[150px]',
      headerClassName: 'w-[20%] min-w-[150px]',
      skeleton: (
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ),
      cell: (brand) => (
        <div className="flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100/70 rounded-lg transition-transform hover:scale-105"
            title="Xem sản phẩm của thương hiệu"
            aria-label={`Xem sản phẩm của thương hiệu ${brand.name}`}
            onClick={() => router.push(`/products?brandId=${brand.id}`)}
          >
            <Package className="h-4 w-4" />
          </Button>
          <ViewActionButton
            onClick={() => handleViewDetail(brand)}
            disabled={isFetching}
            aria-label={`Xem chi tiết thương hiệu ${brand.name}`}
          />
          <EditActionButton
            onClick={() => handleEdit(brand)}
            disabled={isFetching}
            aria-label={`Chỉnh sửa thương hiệu ${brand.name}`}
          />
          <DeleteActionButton
            onClick={() => handleDelete(brand.id)}
            disabled={isFetching}
            aria-label={`Xóa thương hiệu ${brand.name}`}
          />
        </div>
      ),
    },
  ], [handleDelete, handleEdit, handleToggleActive, handleViewDetail, isFetching, updateMutation.isPending, router]);

  const breadcrumbs = [
    { label: 'Thương hiệu', icon: Tag, active: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <PageHeader
        title="Quản lý thương hiệu"
        description="Danh sách các thương hiệu sản phẩm trên hệ thống. Bạn có thể thêm mới, cập nhật hoặc thay đổi trạng thái."
        actions={
          <>
            <ImportButton onClick={() => router.push('/brands/import')} disabled={isForbidden} />
            <ExportButton onExport={handleExport} isLoading={isExporting} disabled={isLoading || isFetching || isForbidden} />
            <AddNewButton label="Thêm thương hiệu" onClick={handleCreate} />
          </>
        }
      />

      <DataCard
        isLoading={isLoading}
        isFetching={isFetching}
        search={
          <SearchInput
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Tìm kiếm thương hiệu..."
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={activeFilter !== null ? 1 : 0}
              onClear={() => updateUrl({ active: undefined, page: 1 })}
            >
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Trạng thái</Label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Tất cả', value: '' },
                    { label: 'Hoạt động', value: 'true' },
                    { label: 'Đã khóa', value: 'false' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-blue-600"
                    >
                      <input
                        type="radio"
                        name="active-filter"
                        checked={(activeFilter || '') === opt.value}
                        onChange={() => updateUrl({ active: opt.value || undefined, page: 1 })}
                        className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={sortOptions}
              currentValue={sort}
              onSelect={(newSort) => setSort(newSort)}
            />

            {(Boolean(name) || activeFilter !== null || sort !== 'createdAt,desc') && (
              <ResetFiltersButton
                onClick={() => {
                  setSearchTerm('');
                  updateUrl({
                    name: undefined,
                    active: undefined,
                    sort: 'createdAt,desc',
                    page: 1,
                  });
                }}
              />
            )}
          </>
        }
        footer={
          !isForbidden && (isLoading || totalPages > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={size}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(s) => setSize(s)}
            />
          )
        }
      >
        <DataTable
          columns={columns}
          data={brands}
          isLoading={isLoading && !brands.length}
          loadingRows={size}
          isForbidden={isForbidden}
          forbiddenState={{
            title: 'Không có quyền xem thương hiệu',
            description: 'Tài khoản của bạn chưa được cấp quyền xem danh sách thương hiệu (brand:read). Vui lòng liên hệ Quản trị viên để được phân quyền.',
          }}
          onRowClick={(brand) => handleViewDetail(brand)}
          emptyState={{
            title: 'Không có thương hiệu nào',
            description: 'Không tìm thấy dữ liệu thương hiệu phù hợp với bộ lọc.',
          }}
        />
      </DataCard>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        description={`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete?.name || ''}" không? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}


