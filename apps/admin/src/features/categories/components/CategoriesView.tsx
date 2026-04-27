'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';

import {
  Button,
  Input,
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Category } from '../types/category.interface';
import { PageResponse } from '@/types/pagination';
import CategoryForm from './CategoryForm';
import { useCategories, useParentCategories } from '../hooks/use-categories';
import { useDeleteCategory } from '../hooks/use-category-mutation';

interface CategoriesViewProps {
  initialData: PageResponse<Category>;
  parentCategories: Category[];
}

export default function CategoriesView({
  initialData,
  parentCategories: serverParentCategories,
}: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const pageParam = Number(searchParams.get('page')) || 0;
  const sizeParam = Number(searchParams.get('size')) || 10;
  const sortParam = searchParams.get('sort') || 'name,asc';
  const nameParam = searchParams.get('name') || '';
  const activeParam = searchParams.get('active');
  const levelParam = searchParams.get('level');

  // TanStack Query - Danh sách chính
  const { data, isLoading, isFetching } = useCategories({
    page: pageParam,
    size: sizeParam,
    sort: sortParam,
    name: nameParam,
    active:
      activeParam === 'true'
        ? true
        : activeParam === 'false'
          ? false
          : undefined,
    level: levelParam ? Number(levelParam) : undefined,
  });

  // TanStack Query - Danh sách cha (Dùng dữ liệu từ server làm initialData để nhanh lần đầu)
  const { data: dynamicParentCategories } = useParentCategories();
  
  // Ưu tiên lấy từ Query (dữ liệu mới nhất), nếu mảng rỗng hoặc chưa có thì dùng từ Server gửi xuống
  const parentCategories = (dynamicParentCategories && dynamicParentCategories.length > 0) 
    ? dynamicParentCategories 
    : serverParentCategories;

  const [searchTerm, setSearchTerm] = useState(nameParam);

  console.log('Checking category data: ', data);

  const createQueryString = useCallback(
    (params: Record<string, string | number>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, String(value));
      });
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateUrl = useCallback(
    (newParams: Record<string, string | number>) => {
      router.push(`${pathname}?${createQueryString(newParams)}`, {
        scroll: false,
      });
    },
    [pathname, router, createQueryString]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== nameParam) {
        updateUrl({ name: searchTerm, page: 0 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, nameParam, updateUrl]);

  const deleteMutation = useDeleteCategory();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  // Sync data from TanStack Query or initialData
  const categoriesData = data || initialData;
  const categories = categoriesData.data || [];
  const pagination = categoriesData.pagination;

  const handlePageChange = (page: number) => {
    updateUrl({ page: page - 1 });
  };

  const handleItemsPerPageChange = (size: number) => {
    updateUrl({ page: 0, size });
  };

  const handleSortChange = (sort: string) => {
    updateUrl({ sort, page: 0 });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: (result) => {
        if (result.success) {
          setDeleteConfirmId(null);
        }
      },
    });
  };

  const commonActions = (
    <>
      <Button variant='outline' size='sm' className='h-9'>
        <Download className='mr-2 h-4 w-4 text-slate-500' /> Xuất file
      </Button>
      <Button
        size='sm'
        variant='default'
        onClick={handleCreate}
        className='h-9 shadow-md shadow-blue-100'>
        <Plus className='mr-2 h-4 w-4' /> Thêm mới
      </Button>
    </>
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
            <div className='relative w-full md:w-80'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Tìm tên danh mục...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-blue-500'
              />
              {(isLoading || isFetching) && (
                <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500' />
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={activeParam || levelParam ? 'default' : 'outline'}
                    className='h-10 text-xs border-slate-200'>
                    <Filter className='mr-2 h-4 w-4 text-slate-400' />
                    Lọc {activeParam || levelParam ? '(Đang bật)' : ''}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-56 p-4'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium text-sm leading-none'>
                        Trạng thái
                      </h4>
                      <div className='flex flex-col gap-1'>
                        <Button
                          variant={!activeParam ? 'secondary' : 'ghost'}
                          size='sm'
                          className='justify-start font-normal'
                          onClick={() => updateUrl({ active: '', page: 0 })}>
                          Tất cả trạng thái
                        </Button>
                        <Button
                          variant={
                            activeParam === 'true' ? 'secondary' : 'ghost'
                          }
                          size='sm'
                          className='justify-start font-normal'
                          onClick={() =>
                            updateUrl({ active: 'true', page: 0 })
                          }>
                          <Badge className='mr-2 h-2 w-2 rounded-full p-0' />{' '}
                          Hoạt động
                        </Button>
                        <Button
                          variant={
                            activeParam === 'false' ? 'secondary' : 'ghost'
                          }
                          size='sm'
                          className='justify-start font-normal'
                          onClick={() =>
                            updateUrl({ active: 'false', page: 0 })
                          }>
                          <Badge
                            variant='secondary'
                            className='mr-2 h-2 w-2 rounded-full p-0'
                          />{' '}
                          Ẩn
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <h4 className='font-medium text-sm leading-none'>
                        Cấp độ (Level)
                      </h4>
                      <div className='grid grid-cols-2 gap-1'>
                        {[1, 2].map((lv) => (
                          <Button
                            key={lv}
                            variant={
                              levelParam === lv.toString()
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            className='h-7 text-[10px]'
                            onClick={() => updateUrl({ level: lv, page: 0 })}>
                            Lv {lv}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {(activeParam || levelParam) && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs mt-2'
                        onClick={() =>
                          updateUrl({ active: '', level: '', page: 0 })
                        }>
                        Xóa tất cả bộ lọc
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-10 text-xs border-slate-200'>
                    <ArrowUpDown className='mr-2 h-4 w-4 text-slate-400' /> Sắp
                    xếp
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-48 p-2'>
                  <div className='flex flex-col gap-1'>
                    <Button
                      variant={sortParam === 'name,asc' ? 'secondary' : 'ghost'}
                      size='sm'
                      className='justify-start font-normal'
                      onClick={() => handleSortChange('name,asc')}>
                      Tên (A-Z)
                    </Button>
                    <Button
                      variant={
                        sortParam === 'name,desc' ? 'secondary' : 'ghost'
                      }
                      size='sm'
                      className='justify-start font-normal'
                      onClick={() => handleSortChange('name,desc')}>
                      Tên (Z-A)
                    </Button>
                    <Button
                      variant={
                        sortParam === 'createdAt,desc' ? 'secondary' : 'ghost'
                      }
                      size='sm'
                      className='justify-start font-normal'
                      onClick={() => handleSortChange('createdAt,desc')}>
                      Mới nhất (Ngày tạo)
                    </Button>
                    <Button
                      variant={
                        sortParam === 'createdAt,asc' ? 'secondary' : 'ghost'
                      }
                      size='sm'
                      className='justify-start font-normal'
                      onClick={() => handleSortChange('createdAt,asc')}>
                      Cũ nhất (Ngày tạo)
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 relative'>
          {/* Loading Overlay */}
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
                            <TableCell colSpan={7} className='h-16'>
                              <div className='flex items-center space-x-4 px-6'>
                                <div className='h-4 w-32 bg-slate-100 animate-pulse rounded' />
                              </div>
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
                                  category.active ? 'default' : 'secondary'
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
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEdit(category)}
                            className='h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50'>
                            <Edit className='h-4 w-4' />
                          </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() =>
                                    setDeleteConfirmId(category.id)
                                  }
                                  className='h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
              {categories.length > 0 && (
                <NextPagination
                  currentPage={pagination.currentPage + 1}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalElements}
                  itemsPerPage={pagination.pageSize}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onPageChange={handlePageChange}
                  className='bg-slate-50/20'
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) setEditingCategory(null);
      }}>
        <DialogContent className='sm:max-w-[500px]'>
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
            initialData={editingCategory ? {
              name: editingCategory.name,
              slug: editingCategory.slug,
              parentId: editingCategory.parentId || 'none',
              description: editingCategory.description || '',
              active: editingCategory.active,
            } : undefined}
            onSuccess={() => setIsFormOpen(false)}
            parentCategories={parentCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle className='text-destructive flex items-center gap-2'>
              <Trash2 className='h-5 w-5' /> Xác nhận xóa
            </DialogTitle>
            <DialogDescription className='py-4'>
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể
              hoàn tác và có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleteMutation.isPending}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : null}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
