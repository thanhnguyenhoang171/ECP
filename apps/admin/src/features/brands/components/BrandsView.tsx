'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Tag, Globe } from 'lucide-react';
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
import {
  SearchInput,
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
import { BrandDetailDialog } from './BrandDetailDialog';

import { Brand } from '../types/brand.interface';
import { PageResponse } from '@/types/pagination';
import { useBrands } from '../hooks/use-brands';
import { useDeleteBrand, useUpdateBrand } from '../hooks/use-brand-mutation';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface BrandsViewProps {
  initialData?: PageResponse<Brand>;
}

export default function BrandsView({ initialData }: BrandsViewProps) {
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

  const { data: queryData, isFetching, isLoading } = useBrands(
    {
      page,
      size,
      sort,
      name,
      active: activeFilter === null ? undefined : activeFilter === 'true',
    },
    initialData?.data?.length ? initialData : undefined,
  );

  const pageData = queryData || initialData;
  const brands = pageData?.data || [];
  const totalPages = pageData?.pagination?.totalPages || 1;
  const totalElements = pageData?.pagination?.totalElements || 0;

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, (val) => updateUrl({ name: val, page: 1 }));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // State Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);

  const handleCreate = useCallback(() => setIsCreateOpen(true), []);
  useHotkeys('+', handleCreate);

  const handleEdit = useCallback((brand: Brand) => {
    setEditingBrand(brand);
  }, []);

  const handleViewDetail = useCallback((brand: Brand) => {
    setViewingBrand(brand);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmId) {
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
            <span
              onClick={() => handleViewDetail(brand)}
              className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer transition-colors"
            >
              {brand.name}
            </span>
            <span className="text-[11px] font-mono text-slate-400 truncate">
              /{brand.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Mô tả',
      className: 'w-[30%] min-w-[180px] text-xs text-slate-500 hidden md:table-cell',
      headerClassName: 'w-[30%] min-w-[180px] hidden md:table-cell',
      skeleton: <Skeleton className="h-4 w-40 rounded-md" />,
      cell: (brand) => (
        <span className="line-clamp-1" title={brand.description || ''}>
          {brand.description || '---'}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      className: 'w-[15%] min-w-[100px]',
      headerClassName: 'w-[15%] min-w-[100px]',
      skeleton: <Skeleton className="h-6 w-16 mx-auto rounded-full" />,
      cell: (brand) => (
        <Badge
          variant={brand.active ? 'default' : 'secondary'}
          className={cn(
            'text-[10px] font-bold py-0.5 px-2 border-none whitespace-nowrap',
            brand.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          )}
        >
          {brand.active ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right',
      className: 'w-[20%] min-w-[120px]',
      headerClassName: 'w-[20%] min-w-[120px]',
      skeleton: (
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ),
      cell: (brand) => (
        <div className="flex justify-end gap-1">
          <ViewActionButton onClick={() => handleViewDetail(brand)} disabled={isFetching} />
          <EditActionButton onClick={() => handleEdit(brand)} disabled={isFetching} />
          <DeleteActionButton onClick={() => handleDelete(brand.id)} disabled={isFetching} />
        </div>
      ),
    },
  ], [handleDelete, handleEdit, handleViewDetail, isFetching]);

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thương hiệu', active: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <PageHeader
        title="Quản lý thương hiệu"
        description="Danh sách các thương hiệu sản phẩm trên hệ thống. Bạn có thể thêm mới, cập nhật hoặc thay đổi trạng thái."
        actions={
          <AddNewButton
            label="Thêm thương hiệu"
            onClick={handleCreate}
          />
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
          (isLoading || totalPages > 0) && (
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
          onRowClick={(brand) => handleViewDetail(brand)}
          emptyState={{
            title: 'Không có thương hiệu nào',
            description: 'Không tìm thấy dữ liệu thương hiệu phù hợp với bộ lọc.',
          }}
        />
      </DataCard>

      {/* Brand Detail Modal */}
      <BrandDetailDialog
        isOpen={!!viewingBrand}
        onOpenChange={(open) => !open && setViewingBrand(null)}
        brand={viewingBrand}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        description={`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete?.name || ''}" không? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}


