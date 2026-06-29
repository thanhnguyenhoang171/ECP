'use client';

import { useState } from 'react';
import {
  Badge,
  NextPagination,
  PageHeader,
  DataTable,
  type ColumnDef,
  DataCard,
  Breadcrumbs,
} from '@/components/common';
import { Layers, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  SearchInput,
  ExportButton,
  ImportButton,
  AddNewButton,
  FilterPopover,
  SortPopover,
  EditActionButton,
  DeleteActionButton,
  ViewActionButton,
  DeleteConfirmDialog,
} from '@/components/common/view-control';

import { Category } from '../types/category.interface';
import { PageResponse } from '@/types/pagination';
import { useCategories, useParentCategories } from '../hooks/use-categories';
import { useDeleteCategory } from '../hooks/use-category-mutation';

import { formatDate, formatDateTimeForFilename } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { cn, isIdLike } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { getSortOptions } from '@/types';
import { toast } from 'sonner';
import { categoryApi } from '../api/category.api';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';

interface CategoriesViewProps {
  initialData: PageResponse<Category>;
  parentCategories: Category[];
}

export default function CategoriesView({
  initialData,
  parentCategories: serverParentCategories,
}: CategoriesViewProps) {
  const router = useRouter();
  const {
    page,
    size,
    sort,
    name,
    updateUrl,
    setPage,
    setSize,
    setSort,
    searchParams,
  } = useViewParams('createdAt,desc');

  const activeParam = searchParams.get('active');
  const levelParam = searchParams.get('level');
  const idParam = searchParams.get('id') || '';

  // TanStack Query
  const { data, isLoading, isFetching } = useCategories(
    {
      page,
      size,
      sort,
      name,
      id: idParam,
      active:
        activeParam === 'true'
          ? true
          : activeParam === 'false'
            ? false
            : undefined,
      level: levelParam ? Number(levelParam) : undefined,
    },
    initialData,
  );

  // Nếu có dữ liệu từ API thì dùng, không thì dùng từ Server
  const { data: dynamicParentCategories } = useParentCategories();
  const parentCategories = dynamicParentCategories?.length
    ? dynamicParentCategories
    : serverParentCategories;

  const handleSearch = (val: string) => {
    if (isIdLike(val)) {
      updateUrl({ id: val, name: '', page: 1 });
    } else {
      updateUrl({ name: val, id: '', page: 1 });
    }
  };

  const [searchTerm, setSearchTerm] = useDebounceSearch(
    name || idParam,
    handleSearch,
  );

  const deleteMutation = useDeleteCategory();

  // States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleEdit = (category: Category) => {
    router.push(`/categories/${category.id}/edit`);
  };

  const handleViewDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailDialogOpen(true);
  };

  const handleCreate = () => {
    router.push('/categories/create');
  };

  useHotkeys('+', handleCreate);

  const handleExportExcelFile = async () => {
    try {
      setIsExporting(true);
      const blob = await categoryApi.export();

      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Đặt tên file
      const filename = `danh-muc_${formatDateTimeForFilename()}.xlsx`;
      link.setAttribute('download', filename);

      // Thêm vào document và click
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const categoriesData = data || initialData;
  const categories = categoriesData.data || [];
  const pagination = categoriesData.pagination;

  const sortOptions = getSortOptions(['NAME', 'DATE']);

  const columns: ColumnDef<Category>[] = [
    {
      header: 'Tên danh mục',
      skeleton: (
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-24' />
        </div>
      ),
      cell: (category) => (
        <div className='flex flex-col'>
          <span className='text-sm font-bold text-slate-900'>
            {category.name}
          </span>
          <span className='text-[10px] text-slate-400 font-medium'>
            ID: {category.id}
          </span>
        </div>
      ),
    },
    {
      header: 'Cấp độ',
      align: 'center',
      skeleton: <Skeleton className='h-5 w-16 mx-auto rounded-full' />,
      cell: (category) => (
        <Badge
          variant='outline'
          className='text-[10px] font-bold border-slate-200 text-slate-500'>
          Cấp {category.level}
        </Badge>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      skeleton: <Skeleton className='h-5 w-20 mx-auto rounded-full' />,
      cell: (category) => (
        <Badge
          variant={category.active ? 'default' : 'destructive'}
          className='text-[10px] font-bold py-0.5 px-2 uppercase tracking-tight border-none whitespace-nowrap'>
          {category.active ? 'Hoạt động' : 'Đã ẩn'}
        </Badge>
      ),
    },
    {
      header: 'Ngày tạo',
      align: 'center',
      skeleton: <Skeleton className='h-4 w-24 mx-auto' />,
      cell: (category) => formatDate(category.createdAt),
      className: 'text-xs font-medium text-slate-500',
    },
    {
      header: 'Ngày sửa',
      align: 'center',
      skeleton: <Skeleton className='h-4 w-24 mx-auto' />,
      cell: (category) => formatDate(category.updatedAt),
      className: 'text-xs font-medium text-slate-500',
    },
    {
      header: 'Thao tác',
      align: 'right',
      skeleton: (
        <div className='flex justify-end gap-1'>
          <Skeleton className='h-8 w-8 rounded-md' />
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>
      ),
      cell: (category) => (
        <div className='flex justify-end gap-1'>
          <ViewActionButton onClick={() => handleViewDetail(category)} disabled={isLoading || isFetching} />
          <EditActionButton onClick={() => handleEdit(category)} disabled={isLoading || isFetching} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(category.id)} disabled={isLoading || isFetching} />
        </div>
      ),
    },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => router.push('/categories/import')} disabled={isLoading || isFetching} />
      <ExportButton onExport={handleExportExcelFile} isLoading={isExporting} disabled={isLoading || isFetching} />
      <AddNewButton onClick={handleCreate} disabled={isLoading || isFetching} />
    </>
  );

  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-medium text-xs px-3 py-2 rounded-lg text-left transition-all flex items-center',
      active
        ? "bg-primary/10 text-primary"
        : "bg-transparent hover:bg-slate-50 text-slate-500",
    );

  const breadcrumbItems = [
    { label: 'Danh mục', icon: Layers },
  ];

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title='Quản lý danh mục'
        description='Quản lý các nhóm sản phẩm và phân loại hàng hóa.'
        actions={commonActions}
      />

      <DataCard
        isLoading={isLoading}
        isFetching={isFetching}
        search={
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Tìm tên hoặc ID danh mục...'
            isLoading={isLoading || isFetching}
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(activeParam ? 1 : 0) + (levelParam ? 1 : 0)}
              onClear={() => updateUrl({ active: '', level: '', page: 1 })}>
              <div className='space-y-4 p-1'>
                <div className='space-y-2'>
                  <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                    Trạng thái
                  </h4>
                  <div className='flex flex-col gap-0.5'>
                    <button
                      className={filterBtnClass(!activeParam)}
                      onClick={() => updateUrl({ active: '', page: 1 })}>
                      Tất cả trạng thái
                    </button>
                    <button
                      className={filterBtnClass(activeParam === 'true')}
                      onClick={() => updateUrl({ active: 'true', page: 1 })}>
                      <div className='mr-2 h-2 w-2 rounded-full bg-green-500' />{' '}
                      Hoạt động
                    </button>
                    <button
                      className={filterBtnClass(activeParam === 'false')}
                      onClick={() => updateUrl({ active: 'false', page: 1 })}>
                      <div className='mr-2 h-2 w-2 rounded-full bg-red-500' />{' '}
                      Ẩn
                    </button>
                  </div>
                </div>

                <div className='space-y-2 pt-2'>
                  <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                    Cấp độ (Level)
                  </h4>
                  <div className='grid grid-cols-2 gap-2 px-3'>
                    {[1, 2].map((lv) => (
                      <button
                        key={lv}
                        className={cn(
                          'h-8 text-xs font-semibold border rounded-lg transition-all',
                          levelParam === lv.toString()
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                        )}
                        onClick={() => updateUrl({ level: lv, page: 1 })}>
                        Lv {lv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={sortOptions}
              currentValue={sort}
              onSelect={setSort}
            />
          </>
        }
        footer={
          categories.length > 0 && (
            <NextPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalElements}
              itemsPerPage={pagination.pageSize}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
              className='bg-slate-50/30'
            />
          )
        }>
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          emptyState={{
            title: 'Chưa có danh mục nào',
            description: 'Bắt đầu phân loại sản phẩm bằng cách tạo danh mục đầu tiên.',
            icon: <Plus className='h-10 w-10 text-primary opacity-80' />,
            iconColor: 'bg-primary/10',
          }}
        />
      </DataCard>


      {/* Dialog hiển thị chi tiết category */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-slate-900'>
              Chi tiết danh mục
            </DialogTitle>
          </DialogHeader>

          {selectedCategory && (
            <div className='space-y-6 mt-4'>
              {/* Thông tin cơ bản */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Tên danh mục
                    </h3>
                    <p className='text-lg font-semibold text-slate-900'>
                      {selectedCategory.name}
                    </p>
                  </div>

                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Đường dẫn (Slug)
                    </h3>
                    <p className='text-sm font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200'>
                      {selectedCategory.slug}
                    </p>
                  </div>

                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Mô tả
                    </h3>
                    <p className='text-sm text-slate-600 leading-relaxed'>
                      {selectedCategory.description || 'Không có mô tả'}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                        Cấp độ
                      </h3>
                      <div className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700'>
                        Cấp {selectedCategory.level}
                      </div>
                    </div>

                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                        Thứ tự
                      </h3>
                      <p className='text-sm font-semibold text-slate-900'>
                        {selectedCategory.order ?? 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Danh mục cha
                    </h3>
                    <p className='text-sm text-slate-600'>
                      {parentCategories.find(c => c.id === selectedCategory.parentId)?.name || 'Không có (Danh mục gốc)'}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Trạng thái
                    </h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      selectedCategory.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedCategory.active ? 'Hoạt động' : 'Đã ẩn'}
                    </div>
                  </div>

                  {selectedCategory.imageUrl && (
                    <div>
                      <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                        Hình ảnh
                      </h3>
                      <img
                        src={selectedCategory.imageUrl}
                        alt={selectedCategory.name}
                        className='w-full h-40 object-cover rounded-lg border border-slate-200'
                      />
                    </div>
                  )}

                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      ID
                    </h3>
                    <p className='text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all'>
                      {selectedCategory.id}
                    </p>
                  </div>

                  <div>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Path
                    </h3>
                    <p className='text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all'>
                      {selectedCategory.path || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              {(selectedCategory.metaTitle || selectedCategory.metaDescription || selectedCategory.metaKeywords) && (
                <div className='border-t border-slate-200 pt-6'>
                  <h3 className='text-sm font-bold text-slate-900 mb-4 flex items-center gap-2'>
                    <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                    </svg>
                    SEO (Search Engine Optimization)
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {selectedCategory.metaTitle && (
                      <div>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                          Meta Title
                        </h4>
                        <p className='text-sm text-slate-700'>{selectedCategory.metaTitle}</p>
                      </div>
                    )}
                    {selectedCategory.metaDescription && (
                      <div>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                          Meta Description
                        </h4>
                        <p className='text-sm text-slate-700'>{selectedCategory.metaDescription}</p>
                      </div>
                    )}
                    {selectedCategory.metaKeywords && (
                      <div>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                          Meta Keywords
                        </h4>
                        <p className='text-sm text-slate-700'>{selectedCategory.metaKeywords}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className='border-t border-slate-200 pt-4'>
                <div className='grid grid-cols-2 gap-4 text-xs text-slate-500'>
                  <div>
                    <span className='font-semibold'>Ngày tạo:</span>{' '}
                    {formatDate(selectedCategory.createdAt)}
                  </div>
                  <div>
                    <span className='font-semibold'>Ngày cập nhật:</span>{' '}
                    {formatDate(selectedCategory.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={() =>
          deleteConfirmId &&
          deleteMutation.mutate(deleteConfirmId, {
            onSuccess: () => setDeleteConfirmId(null),
          })
        }
        description='Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.'
      />
    </div>
  );
}
