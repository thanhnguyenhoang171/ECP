'use client';

import Image from 'next/image';
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
import { CategoryDetailDialog } from './CategoryDetailDialog';
import { CategoryTreeView } from './CategoryTreeView';
import {
 SearchInput,
 ExportButton,
 ImportButton,
 AddNewButton,
 FilterPopover,
 SortPopover,
 ResetFiltersButton,
 EditActionButton,
 DeleteActionButton,
 ViewActionButton,
 DeleteConfirmDialog,
} from '@/components/common/view-control';

import { Category } from '../types/category.interface';
import { PageResponse } from '@/types/pagination';
import { useCategories, useParentCategories } from '../hooks/use-categories';
import { useDeleteCategory, useUpdateCategory } from '../hooks/use-category-mutation';

import { formatDate, formatDateTimeForFilename } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { cn, isIdLike } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getSortOptions } from '@/types';
import { toast } from 'sonner';
import { categoryApi } from '../api/category.api';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { Skeleton } from '@/components/ui/skeleton';

import { useRouter } from 'next/navigation';

interface CategoriesViewProps {
 initialData?: PageResponse<Category>;
 parentCategories?: Category[];
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
 const isFeaturedParam = searchParams.get('isFeatured');
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
   isFeatured:
    isFeaturedParam === 'true'
     ? true
     : isFeaturedParam === 'false'
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

 const [viewMode, setViewMode] = useState<'tree' | 'table'>('table');

 const deleteMutation = useDeleteCategory();
 const updateMutation = useUpdateCategory();

 const handleToggleActive = (category: Category) => {
  updateMutation.mutate({
   id: category.id,
   values: { active: !category.active } as any,
  });
 };

 const handleToggleFeatured = (category: Category) => {
  updateMutation.mutate({
   id: category.id,
   values: { isFeatured: !category.isFeatured } as any,
  });
 };

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

   const url = window.URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;

   const filename = `danh-muc_${formatDateTimeForFilename()}.xlsx`;
   link.setAttribute('download', filename);

   document.body.appendChild(link);
   link.click();

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
 const categories = Array.isArray(categoriesData?.data)
  ? categoriesData.data
  : Array.isArray(categoriesData)
   ? categoriesData
   : [];
 const pagination = categoriesData?.pagination || { currentPage: 1, totalPages: 1, totalElements: categories.length, pageSize: 10 };

 const sortOptions = getSortOptions(['NAME', 'DATE']);

 const columns: ColumnDef<Category>[] = [
  {
   header: 'Tên danh mục',
   className: 'w-[28%] min-w-[200px]',
   headerClassName: 'w-[28%] min-w-[200px]',
   skeleton: (
    <div className='flex items-center gap-3'>
     <Skeleton className='h-10 w-10 rounded-lg' />
     <div className='flex flex-col gap-2'>
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-3 w-24' />
     </div>
    </div>
   ),
    cell: (category) => {
      const thumbObj = category.image || category.imageUrl;
      const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

      return (
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center p-1'>
            {thumbUrl ? (
              <Image
                src={thumbUrl}
                alt={category.name}
                width={40}
                height={40}
                className='w-full h-full object-contain'
                unoptimized
              />
            ) : (
              <Layers className='w-5 h-5 text-slate-400' />
            )}
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-bold text-slate-900 line-clamp-1'>
              {category.name}
            </span>
            <span className='text-[10px] text-slate-400 font-medium'>
              ID: {category.id}
            </span>
          </div>
        </div>
      );
    },
  },
  {
   header: 'Cấp độ',
   align: 'center',
   className: 'w-[10%] min-w-[80px]',
   headerClassName: 'w-[10%] min-w-[80px]',
   skeleton: <Skeleton className='h-5 w-16 mx-auto rounded-full' />,
   cell: (category) => (
    <Badge
     variant='outline'
     className='text-[10px] font-bold border-slate-200 text-slate-500'
    >
     Cấp {category.level}
    </Badge>
   ),
  },
  {
   header: 'Trạng thái',
   align: 'center',
   className: 'w-[12%] min-w-[100px]',
   headerClassName: 'w-[12%] min-w-[100px]',
   skeleton: <Skeleton className='h-5 w-20 mx-auto rounded-full' />,
   cell: (category) => {
    const isPending = updateMutation.isPending && updateMutation.variables?.id === category.id;
    return (
     <div className="flex justify-center items-center">
       <Badge
        variant={category.active ? 'default' : 'destructive'}
        className={cn(
         'text-[10px] font-bold py-0.5 px-2 uppercase tracking-tight border-none whitespace-nowrap cursor-pointer hover:opacity-80 transition-all select-none',
         isPending && 'pointer-events-none opacity-50'
        )}
        onClick={() => handleToggleActive(category)}
       >
        {category.active ? 'Hoạt động' : 'Đã ẩn'}
       </Badge>
     </div>
    );
   },
  },
  {
   header: 'Nổi bật',
   align: 'center',
   className: 'w-[12%] min-w-[100px]',
   headerClassName: 'w-[12%] min-w-[100px]',
   skeleton: <Skeleton className='h-5 w-16 mx-auto rounded-full' />,
   cell: (category) => (
    <div className="flex justify-center items-center">
      <Switch 
        checked={!!category.isFeatured}
        onCheckedChange={() => handleToggleFeatured(category)}
        disabled={updateMutation.isPending && updateMutation.variables?.id === category.id}
        className="scale-75 data-[state=checked]:bg-amber-500"
      />
    </div>
   ),
  },
  {
   header: 'Ngày tạo',
   align: 'center',
   className: 'w-[14%] min-w-[110px] text-xs font-medium text-slate-500',
   headerClassName: 'w-[14%] min-w-[110px]',
   skeleton: <Skeleton className='h-4 w-24 mx-auto' />,
   cell: (category) => formatDate(category.createdAt),
  },
  {
   header: 'Ngày sửa',
   align: 'center',
   className: 'w-[14%] min-w-[110px] text-xs font-medium text-slate-500',
   headerClassName: 'w-[14%] min-w-[110px]',
   skeleton: <Skeleton className='h-4 w-24 mx-auto' />,
   cell: (category) => formatDate(category.updatedAt),
  },
  {
   header: 'Thao tác',
   align: 'right',
   className: 'w-[10%] min-w-[110px]',
   headerClassName: 'w-[10%] min-w-[110px]',
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
   <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 mr-2">
     <button
       onClick={() => setViewMode('tree')}
       className={cn(
         "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
         viewMode === 'tree' ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
       )}
     >
       Cây thư mục (Tree)
     </button>
     <button
       onClick={() => setViewMode('table')}
       className={cn(
         "px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
         viewMode === 'table' ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
       )}
     >
       Dạng bảng (Table)
     </button>
   </div>
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
       activeCount={(activeParam ? 1 : 0) + (levelParam ? 1 : 0) + (isFeaturedParam ? 1 : 0)}
       onClear={() => updateUrl({ active: '', level: '', isFeatured: '', page: 1 })}
      >
       <div className='space-y-4 p-1'>
        <div className='space-y-2'>
         <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
          Trạng thái
         </h4>
         <div className='flex flex-col gap-0.5'>
          <button className={filterBtnClass(!activeParam)} onClick={() => updateUrl({ active: '', page: 1 })}>
           Tất cả trạng thái
          </button>
          <button className={filterBtnClass(activeParam === 'true')} onClick={() => updateUrl({ active: 'true', page: 1 })}>
           <div className='mr-2 h-2 w-2 rounded-full bg-green-500' />{' '}
           Hoạt động
          </button>
          <button className={filterBtnClass(activeParam === 'false')} onClick={() => updateUrl({ active: 'false', page: 1 })}>
           <div className='mr-2 h-2 w-2 rounded-full bg-red-500' />{' '}
           Ẩn
          </button>
         </div>
        </div>

        <div className='space-y-2 pt-2 border-t border-slate-100'>
         <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
          Danh mục nổi bật
         </h4>
         <div className='flex flex-col gap-0.5'>
          <button className={filterBtnClass(!isFeaturedParam)} onClick={() => updateUrl({ isFeatured: '', page: 1 })}>
           Tất cả
          </button>
          <button className={filterBtnClass(isFeaturedParam === 'true')} onClick={() => updateUrl({ isFeatured: 'true', page: 1 })}>
           <div className='mr-2 h-2 w-2 rounded-full bg-amber-500' />{' '}
           Danh mục nổi bật (Home)
          </button>
          <button className={filterBtnClass(isFeaturedParam === 'false')} onClick={() => updateUrl({ isFeatured: 'false', page: 1 })}>
           <div className='mr-2 h-2 w-2 rounded-full bg-slate-300' />{' '}
           Danh mục thường
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
            onClick={() => updateUrl({ level: lv, page: 1 })}
           >
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

      {(Boolean(searchTerm) || Boolean(activeParam) || Boolean(levelParam) || Boolean(isFeaturedParam) || sort !== 'name,asc') && (
       <ResetFiltersButton
        onClick={() => {
         setSearchTerm('');
         updateUrl({
          name: '',
          id: '',
          active: '',
          level: '',
          isFeatured: '',
          sort: 'name,asc',
          page: 1,
         });
        }}
       />
      )}
     </>
    }
    footer={
     viewMode === 'table' && (isLoading || categories.length > 0) && (
      <NextPagination
       isLoading={isLoading}
       currentPage={pagination.currentPage}
       totalPages={pagination.totalPages}
       totalItems={pagination.totalElements}
       itemsPerPage={pagination.pageSize}
       onItemsPerPageChange={setSize}
       onPageChange={setPage}
      />
     )
    }
   >
        {viewMode === 'tree' ? (
          <div className="p-4">
            <CategoryTreeView
              categories={categories}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onAddSub={(parentCategory) => router.push(`/categories/create?parentId=${parentCategory.id}`)}
            />
          </div>
        ) : (
          <DataTable
           columns={columns}
           data={categories}
           isLoading={isLoading || (isFetching && !categories.length)}
           loadingRows={size}
           emptyState={{
            title: 'Không tìm thấy danh mục',
            description:
             'Thử thay đổi bộ lọc tìm kiếm hoặc tạo danh mục sản phẩm mới.',
            icon: <Layers className='h-10 w-10 text-primary opacity-80' />,
            iconColor: 'bg-primary/10',
           }}
          />
        )}
   </DataCard>

   {/* Dialog hiển thị chi tiết category */}
   <CategoryDetailDialog
     isOpen={isDetailDialogOpen}
     onOpenChange={setIsDetailDialogOpen}
     category={selectedCategory}
     parentCategories={parentCategories || []}
   />

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
