'use client';

import React, { useState } from 'react';
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
} from '@/components/common';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BrandDetailDialog } from './BrandDetailDialog';

import { Brand } from '../types/brand.interface';
import { PageResponse } from '@/types/pagination';
import { useBrands } from '../hooks/use-brands';
import { useDeleteBrand, useUpdateBrand } from '../hooks/use-brand-mutation';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface BrandsViewProps {
  initialData?: PageResponse<Brand>;
}

export default function BrandsView({ initialData }: BrandsViewProps) {
  const router = useRouter();
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
  } = useViewParams('name,asc');

  const activeParam = searchParams.get('active');
  const activeFilter =
    activeParam === 'true' ? true : activeParam === 'false' ? false : undefined;

  const { data: queryData, isFetching } = useBrands({
    page,
    size,
    sort,
    name: name || undefined,
    active: activeFilter,
  });

  const deleteMutation = useDeleteBrand();
  const updateMutation = useUpdateBrand();

  const pageData = queryData || initialData;
  const brands = pageData?.data || [];
  const totalPages = pageData?.pagination?.totalPages || 1;
  const totalElements = pageData?.pagination?.totalElements || 0;

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, (val) =>
    updateUrl({ name: val, page: 1 })
  );

  // States for dialogs
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleViewDetail = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDetailOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    router.push(`/brands/${brand.id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteMutation.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      setTogglingId(brand.id);
      await updateMutation.mutateAsync({
        id: brand.id,
        values: { active: !brand.active },
      });
    } finally {
      setTogglingId(null);
    }
  };

  const sortOptions = [
    { label: 'Tên (A-Z)', value: 'name,asc' },
    { label: 'Tên (Z-A)', value: 'name,desc' },
    { label: 'Mới nhất', value: 'createdAt,desc' },
    { label: 'Cũ nhất', value: 'createdAt,asc' },
  ];

  const columns: ColumnDef<Brand>[] = [
    {
      header: 'Thương hiệu',
      cell: (brand) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center p-1">
            {brand.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
                unoptimized
              />
            ) : (
              <Tag className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 line-clamp-1">
              {brand.name}
            </span>
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe size={11} /> {brand.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Slug',
      className: 'hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (brand) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {brand.slug}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (brand) => {
        const isPending = togglingId === brand.id;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge
              className={cn(
                'cursor-pointer select-none transition-all text-xs font-medium hover:opacity-80',
                brand.active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200',
                isPending && 'pointer-events-none opacity-50'
              )}
              onClick={() => handleToggleActive(brand)}
            >
              {brand.active ? 'Hoạt động' : 'Đã khóa'}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Ngày tạo',
      className: 'hidden lg:table-cell text-slate-500 text-xs',
      headerClassName: 'hidden lg:table-cell',
      cell: (brand) => (brand.createdAt ? formatDate(brand.createdAt) : '---'),
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (brand) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <ViewActionButton onClick={() => handleViewDetail(brand)} />
          <EditActionButton onClick={() => handleEdit(brand)} />
          <DeleteActionButton onClick={() => handleDelete(brand.id)} />
        </div>
      ),
    },
  ];

  const brandToDelete = brands.find((b) => b.id === deleteConfirmId);

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumbs items={[{ label: 'Thương hiệu', icon: Tag }]} />

      <PageHeader
        title="Quản lý Thương hiệu"
        description="Danh sách các thương hiệu sản phẩm trên hệ thống. Bạn có thể thêm mới, cập nhật hoặc thay đổi trạng thái."
        action={
          <AddNewButton
            label="Thêm thương hiệu"
            onClick={() => router.push('/brands/create')}
          />
        }
      />

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Tìm kiếm thương hiệu..."
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <FilterPopover
            activeCount={activeFilter !== undefined ? 1 : 0}
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
                      checked={(activeParam || '') === opt.value}
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

          {(Boolean(name) || activeFilter !== undefined || sort !== 'name,asc') && (
            <ResetFiltersButton
              onClick={() => {
                setSearchTerm('');
                updateUrl({
                  name: undefined,
                  active: undefined,
                  sort: 'name,asc',
                  page: 1,
                });
              }}
            />
          )}
        </div>
      </div>

      {/* Main Table View (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={brands}
          isLoading={isFetching}
          onRowClick={(brand) => handleViewDetail(brand)}
          emptyState={{
            title: 'Không có thương hiệu nào',
            description: 'Không tìm thấy dữ liệu thương hiệu phù hợp với bộ lọc.',
          }}
        />
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {isFetching ? (
          <div className="p-8 text-center text-slate-400">Đang tải dữ liệu...</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Không tìm thấy thương hiệu nào.
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => handleViewDetail(brand)}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <Tag className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{brand.name}</span>
                    <span className="font-mono text-xs text-slate-400">{brand.slug}</span>
                  </div>
                </div>
                <Badge
                  className={
                    brand.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                      : 'bg-slate-100 text-slate-500 border-slate-200 text-[10px]'
                  }
                >
                  {brand.active ? 'Hoạt động' : 'Đã khóa'}
                </Badge>
              </div>

              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe size={12} /> {brand.website}
                </a>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Badge
                    className={cn(
                      'cursor-pointer select-none transition-all text-xs font-medium hover:opacity-80',
                      brand.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200',
                      togglingId === brand.id && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => handleToggleActive(brand)}
                  >
                    {brand.active ? 'Hoạt động' : 'Đã khóa'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <ViewActionButton onClick={() => handleViewDetail(brand)} />
                  <EditActionButton onClick={() => handleEdit(brand)} />
                  <DeleteActionButton onClick={() => handleDelete(brand.id)} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <NextPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={size}
          onPageChange={(p) => setPage(p)}
          onItemsPerPageChange={(s) => setSize(s)}
        />
      )}

      {/* Brand Detail Modal */}
      <BrandDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        brand={selectedBrand}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Xóa thương hiệu"
        description={`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete?.name || ''}" không? Hành động này không thể hoàn tác.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}


