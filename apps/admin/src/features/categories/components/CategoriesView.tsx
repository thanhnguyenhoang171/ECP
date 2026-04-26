'use client';

import React, { useState } from 'react';
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
import { toast } from 'sonner';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Category } from '../types/category.interface';
import { PageResponse } from '@/types/pagination';
import CategoryForm from './CategoryForm';
import { deleteCategoryAction } from '../actions/category.action';

interface CategoriesViewProps {
  initialData: PageResponse<Category>;
  parentCategories: any[];
}

export default function CategoriesView({
  initialData,
  parentCategories,
}: CategoriesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPage = initialData.pagination.currentPage + 1;
  const itemsPerPage = initialData.pagination.pageSize;
  const currentSort = searchParams.get('sort') || 'name,asc';

  const createQueryString = (params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, String(value));
    });
    return newSearchParams.toString();
  };

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString({ page: page - 1 })}`);
  };

  const handleItemsPerPageChange = (size: number) => {
    router.push(`${pathname}?${createQueryString({ page: 0, size })}`);
  };

  const handleSortChange = (sort: string) => {
    router.push(`${pathname}?${createQueryString({ sort, page: 0 })}`);
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
    } catch (e) {
      return dateString;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    try {
      const result = await deleteCategoryAction(deleteConfirmId);
      console.log('Checking remove result = ', result);
      if (result.success) {
        toast.success('Xóa danh mục thành công');
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        toast.error(result.message || 'Lỗi khi xóa danh mục');
      }
    } catch (error) {
      toast.error('Lỗi kết nối hệ thống');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = initialData.data;

  const commonActions = (
    <>
      <Button variant='outline' size='sm' className='h-9'>
        <Download className='mr-2 h-4 w-4 text-slate-500' /> Xuất file
      </Button>
      <Button
        size='sm'
        variant='default'
        onClick={() => setIsFormOpen(true)}
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

      {categories.length === 0 ? (
        <EmptyState
          title='Chưa có danh mục nào'
          description='Bắt đầu phân loại sản phẩm bằng cách tạo danh mục đầu tiên.'
          icon={<Plus className='h-10 w-10 text-blue-500 opacity-80' />}
          iconColor='bg-blue-50'
        />
      ) : (
        <Card className='shadow-sm border-slate-100 overflow-hidden'>
          <CardHeader className='pb-4 bg-slate-50/30 border-b border-slate-50'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='relative w-full md:w-80'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
                <Input
                  placeholder='Tìm tên danh mục...'
                  className='pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-blue-500'
                />
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  className='h-10 text-xs border-slate-200'>
                  <Filter className='mr-2 h-4 w-4 text-slate-400' /> Lọc
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-10 text-xs border-slate-200'>
                      <ArrowUpDown className='mr-2 h-4 w-4 text-slate-400' /> Sắp
                      xếp
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleSortChange('name,asc')}
                      className={currentSort === 'name,asc' ? 'bg-slate-100 font-medium' : ''}>
                      Tên (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange('name,desc')}
                      className={currentSort === 'name,desc' ? 'bg-slate-100 font-medium' : ''}>
                      Tên (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleSortChange('createdAt,desc')}
                      className={currentSort === 'createdAt,desc' ? 'bg-slate-100 font-medium' : ''}>
                      Mới nhất (Ngày tạo)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange('createdAt,asc')}
                      className={currentSort === 'createdAt,asc' ? 'bg-slate-100 font-medium' : ''}>
                      Cũ nhất (Ngày tạo)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
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
                  {categories.map((category) => (
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
                      <TableCell className='text-center py-4'>
                        <Badge
                          variant='outline'
                          className='text-[10px] font-mono'>
                          Level {category.level}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center py-4'>
                        <Badge
                          variant={category.active ? 'default' : 'secondary'}
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
                            className='h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteConfirmId(category.id)}
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
            <NextPagination
              currentPage={currentPage}
              totalPages={initialData.pagination.totalPages}
              totalItems={initialData.pagination.totalElements}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={handlePageChange}
              className='bg-slate-50/20'
            />
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-slate-900'>
              Tạo danh mục mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin để thêm một danh mục sản phẩm vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSuccess={() => {
              setIsFormOpen(false);
              router.refresh();
            }}
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
              disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}>
              {isDeleting ? (
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
