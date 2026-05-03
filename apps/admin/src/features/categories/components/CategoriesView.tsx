'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Card,
  CardContent,
  CardHeader,
  NextPagination,
  PageHeader,
  EmptyState,
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
import { set } from 'nprogress';
import { categoryApi } from '../api/category.api';
import { toast } from 'sonner';

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
      updateUrl({ id: val, name: '', page: 0 });
    } else {
      updateUrl({ name: val, id: '', page: 0 });
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

  const sortOptions = [
    { label: 'Tên (A-Z)', value: 'name,asc' },
    { label: 'Tên (Z-A)', value: 'name,desc' },
    { label: 'Mới nhất (Ngày tạo)', value: 'createdAt,desc' },
    { label: 'Cũ nhất (Ngày tạo)', value: 'createdAt,asc' },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => setIsImportDialogOpen(true)} />
      <ExportButton onExport={handleExportExcelFile} isLoading={isExporting} />
      <AddNewButton onClick={handleCreate} />
    </>
  );

  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-normal text-xs px-2 py-1.5 rounded-md text-left transition-colors flex items-center',
      active
        ? 'bg-slate-100 text-slate-900'
        : 'hover:bg-slate-50 text-slate-500',
    );

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Quản lý danh mục'
        description='Quản lý các nhóm sản phẩm và phân loại hàng hóa.'
        actions={commonActions}
      />

      <Card className='shadow-sm border-slate-100 overflow-hidden'>
        <CardHeader className='pb-4 bg-slate-50/30 border-b border-slate-50'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder='Tìm tên hoặc ID danh mục...'
              isLoading={isLoading || isFetching}
            />

            <div className='flex items-center gap-2'>
              <FilterPopover
                activeCount={(activeParam ? 1 : 0) + (levelParam ? 1 : 0)}
                onClear={() => updateUrl({ active: '', level: '', page: 0 })}>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-xs leading-none'>
                      Trạng thái
                    </h4>
                    <div className='flex flex-col gap-1'>
                      <button
                        className={filterBtnClass(!activeParam)}
                        onClick={() => updateUrl({ active: '', page: 0 })}>
                        Tất cả trạng thái
                      </button>
                      <button
                        className={filterBtnClass(activeParam === 'true')}
                        onClick={() => updateUrl({ active: 'true', page: 0 })}>
                        <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-blue-500' />{' '}
                        Hoạt động
                      </button>
                      <button
                        className={filterBtnClass(activeParam === 'false')}
                        onClick={() => updateUrl({ active: 'false', page: 0 })}>
                        <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-red-500' />{' '}
                        Ẩn
                      </button>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-xs leading-none'>
                      Cấp độ (Level)
                    </h4>
                    <div className='grid grid-cols-2 gap-1'>
                      {[1, 2].map((lv) => (
                        <button
                          key={lv}
                          className={cn(
                            'h-7 text-[10px] border rounded-md transition-colors',
                            levelParam === lv.toString()
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                          )}
                          onClick={() => updateUrl({ level: lv, page: 0 })}>
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
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 relative'>
          {isFetching && !isLoading && (
            <div className='absolute inset-0 bg-white/40 z-10 flex items-center justify-center backdrop-blur-[1px]' />
          )}

          {categories.length === 0 && !isLoading ? (
            <div className='py-20'>
              <EmptyState
                title='Chưa có danh mục nào'
                description='Bắt đầu phân loại sản phẩm bằng cách tạo danh mục đầu tiên.'
                icon={<Plus className='h-10 w-10 text-blue-500 opacity-80' />}
                iconColor='bg-blue-50'
              />
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-slate-50/50'>
                    <TableRow>
                      <TableHead className='text-[11px] font-bold uppercase py-4 px-6 text-slate-500'>
                        Tên danh mục
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-slate-500'>
                        Đường dẫn (Slug)
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-slate-500'>
                        Path
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-center text-slate-500'>
                        Cấp độ
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-center text-slate-500'>
                        Trạng thái
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-center text-slate-500'>
                        Ngày tạo
                      </TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-right pr-6 text-slate-500'>
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className='h-16 px-6'>
                              <div className='h-4 w-full bg-slate-100 animate-pulse rounded' />
                            </TableCell>
                          </TableRow>
                        ))
                      : categories.map((category) => (
                          <TableRow
                            key={category.id}
                            className='hover:bg-slate-50/30 transition-colors border-b border-slate-50'>
                            <TableCell className='py-4 px-6'>
                              <div className='flex flex-col'>
                                <span className='text-sm font-bold text-slate-700'>
                                  {category.name}
                                </span>
                                <span className='text-[11px] text-slate-400'>
                                  ID: {category.id}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='py-4'>
                              <code className='text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600'>
                                /{category.slug}
                              </code>
                            </TableCell>
                            <TableCell className='py-4'>
                              <span className='text-[11px] text-slate-500 font-mono'>
                                {category.path || '---'}
                              </span>
                            </TableCell>
                            <TableCell className='text-center py-4'>
                              <Badge
                                variant='outline'
                                className='text-[10px] font-mono'>
                                Level {category.level}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-center py-4'>
                              <Badge
                                variant={
                                  category.active ? 'default' : 'destructive'
                                }
                                className='text-[10px] h-5 px-2'>
                                {category.active ? 'Hoạt động' : 'Ẩn'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-center py-4 text-[11px] text-slate-500'>
                              {formatDate(category.createdAt)}
                            </TableCell>
                            <TableCell className='text-right py-4 pr-6'>
                              <div className='flex justify-end gap-1'>
                                <EditActionButton
                                  onClick={() => handleEdit(category)}
                                />
                                <DeleteActionButton
                                  onClick={() =>
                                    setDeleteConfirmId(category.id)
                                  }
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
              <NextPagination
                currentPage={pagination.currentPage + 1}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalElements}
                itemsPerPage={pagination.pageSize}
                onItemsPerPageChange={setSize}
                onPageChange={(p) => setPage(p - 1)}
                className='bg-slate-50/20'
              />
            </>
          )}
        </CardContent>
      </Card>

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
