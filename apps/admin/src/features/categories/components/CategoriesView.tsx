'use client';

import { useState } from 'react';
import {
  Badge,
  NextPagination,
  PageHeader,
  DataTable,
  type ColumnDef,
  DataCard,
} from '@/components/common';
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
  DeleteConfirmDialog,
} from '@/components/common/view-control';

import { Category } from '../types/category.interface';
import { PageResponse } from '@/types/pagination';
import CategoryForm from './CategoryForm';
import CategoryImportDialog from './CategoryImportDialog';
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

interface CategoriesViewProps {
  initialData: PageResponse<Category>;
  parentCategories: Category[];
}

export default function CategoriesView({
  initialData,
  parentCategories: serverParentCategories,
}: CategoriesViewProps) {
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
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
      cell: (category) => formatDate(category.createdAt),
      className: 'text-xs font-medium text-slate-500',
    },
    {
      header: 'Ngày sửa',
      align: 'center',
      cell: (category) => formatDate(category.updatedAt),
      className: 'text-xs font-medium text-slate-500',
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (category) => (
        <div className='flex justify-end gap-1'>
          <EditActionButton onClick={() => handleEdit(category)} disabled={isLoading || isFetching} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(category.id)} disabled={isLoading || isFetching} />
        </div>
      ),
    },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => setIsImportDialogOpen(true)} disabled={isLoading || isFetching} />
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

  return (
    <div className='space-y-6'>
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

      {/* Dialogs */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(null);
        }}>
        <DialogContent className='sm:max-w-125'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-slate-900'>
              {editingCategory ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Chỉnh sửa thông tin danh mục sản phẩm.'
                : 'Nhập thông tin để thêm một danh mục sản phẩm vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            id={editingCategory?.id}
            initialData={
              editingCategory
                ? {
                    name: editingCategory.name,
                    slug: editingCategory.slug,
                    parentId: editingCategory.parentId || 'none',
                    active: editingCategory.active,
                  }
                : undefined
            }
            onSuccess={() => setIsFormOpen(false)}
            parentCategories={parentCategories}
          />
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

      <CategoryImportDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}
