'use client';

import React, { useState } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Badge,
  NextPagination,
  PageHeader,
  DataTable,
  type ColumnDef,
  DataCard,
  Breadcrumbs,
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

import { Product } from '../types/product.interface';
import { Category } from '@/features/categories/types/category.interface';
import { PageResponse } from '@/types/pagination';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { getSortOptions } from '@/types';
import { cn } from '@/lib/utils';
import { useProducts, useProductDetail } from '../hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';

import ProductForm from './ProductForm';

interface ProductViewProps {
  initialData: PageResponse<Product>;
  categories: Category[];
}

export default function ProductView({
  initialData,
  categories,
}: ProductViewProps) {
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

  const categoryIdParam = searchParams.get('categoryId') || '';
  const isPublishedParam = searchParams.get('isPublished');

  const { data: queryData, isFetching } = useProducts({
    page,
    size,
    sort,
    search: name,
    categoryId: categoryIdParam,
  });

  const { data: categoriesData } = useCategories({ page: 0, size: 100 });
  const categoriesList = categoriesData?.data || categories;

  const pageData = queryData || initialData;
  const paginatedProducts = pageData.data || [];
  const totalPages = pageData.pagination?.totalPages || 1;
  const totalElements = pageData.pagination?.totalElements || 0;

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, (val) => updateUrl({ name: val, page: 1 }));

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: detailData, isFetching: isDetailFetching } = useProductDetail(editingProduct?.id);
  const activeProduct = detailData || editingProduct;
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    router.push('/products/create');
  };

  useHotkeys('+', handleCreate);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất file thành công (Demo)');
      setIsExporting(false);
    }, 1000);
  };

  const sortOptions = getSortOptions(['NAME', 'PRICE']);

  const columns: ColumnDef<Product>[] = [
    {
      header: 'Sản phẩm',
      cell: (product) => {
        const thumbObj = product.thumbnail as any;
        const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

        return (
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center'>
              {thumbUrl ? (
                <Image src={thumbUrl} alt={product.name} width={48} height={48} className='w-full h-full object-cover' />
              ) : (
                <Package className='w-5 h-5 text-slate-400' />
              )}
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-bold text-slate-900 line-clamp-1' title={product.name}>{product.name}</span>
              <div className='flex items-center gap-2 mt-0.5'>
                <span className='font-mono text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded'>{product.sku}</span>
                {product.brand && <span className='text-[11px] text-slate-500'>• {product.brand}</span>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Danh mục',
      className: 'text-sm hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (product) => {
        const cat = categoriesList.find(c => c.id === product.categoryId);
        return <span className='text-slate-600 font-medium'>{cat ? cat.name : (product.categoryName || '---')}</span>;
      }
    },
    {
      header: 'Giá bán',
      align: 'right',
      cell: (product) => {
        const variants = product.variants || [];
        const minPrice = variants.length > 0
          ? Math.min(...variants.map(v => v.price))
          : (product.price || 0); // fallback to 0 if neither variants nor price exists

        return (
          <div className='flex flex-col items-end'>
            <span className='text-sm font-bold text-blue-600'>{formatCurrency(minPrice)}</span>
            {variants.length > 1 && (
              <span className='text-[10px] text-slate-400 mt-0.5'>{variants.length} phân loại</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (product) => {
        const isPublished = product.isPublished ?? (product as any).published;
        return (
          <Badge
            variant={isPublished ? 'default' : 'secondary'}
            className={cn(
              'text-[11px] py-0.5 px-2 whitespace-nowrap border-none',
              isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600'
            )}
          >
            {isPublished ? 'Đang bán' : 'Ngừng bán'}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (product) => (
        <div className='flex justify-end gap-1'>
          <EditActionButton onClick={() => handleEdit(product)} disabled={isExporting} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(product.id)} disabled={isExporting} />
        </div>
      ),
    },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => toast.info('Tính năng Nhập file đang được phát triển (Demo)')} disabled={isExporting} />
      <ExportButton onExport={handleExport} isLoading={isExporting} />
      <AddNewButton onClick={handleCreate} disabled={isExporting} />
    </>
  );

  const filterBtnClass = (active: boolean) => cn(
    "justify-start font-normal text-xs px-2 py-1.5 rounded-md text-left transition-colors flex items-center",
    active ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-500"
  );

  const breadcrumbItems = [
    { label: 'Sản phẩm', icon: Package },
  ];

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader title='Quản lý sản phẩm' description='Xem và quản lý danh mục sản phẩm của bạn.' actions={commonActions} />

      <DataCard
        search={<SearchInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm tên sản phẩm...' />}
        extra={
          <>
            <FilterPopover
              activeCount={(categoryIdParam ? 1 : 0) + (isPublishedParam ? 1 : 0)}
              onClear={() => updateUrl({ categoryId: '', isPublished: '', page: 1 })}
            >
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='font-medium text-xs leading-none'>Danh mục</h4>
                  <div className='flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar'>
                    <button className={filterBtnClass(!categoryIdParam)} onClick={() => updateUrl({ categoryId: '', page: 1 })}>
                      Tất cả danh mục
                    </button>
                    {categoriesList.map((cat) => (
                      <button key={cat.id} className={filterBtnClass(categoryIdParam === cat.id)} onClick={() => updateUrl({ categoryId: cat.id, page: 1 })}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='font-medium text-xs leading-none'>Trạng thái</h4>
                  <div className='flex flex-col gap-1'>
                    <button className={filterBtnClass(!isPublishedParam)} onClick={() => updateUrl({ isPublished: '', page: 1 })}>
                      Tất cả trạng thái
                    </button>
                    <button className={filterBtnClass(isPublishedParam === 'true')} onClick={() => updateUrl({ isPublished: 'true', page: 1 })}>
                      <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-blue-500' /> Đang bán
                    </button>
                    <button className={filterBtnClass(isPublishedParam === 'false')} onClick={() => updateUrl({ isPublished: 'false', page: 1 })}>
                      <Badge variant='secondary' className='mr-2 h-2 w-2 rounded-full p-0' /> Ngừng bán
                    </button>
                  </div>
                </div>
              </div>
            </FilterPopover>

            <SortPopover options={sortOptions} currentValue={sort} onSelect={setSort} />
          </>
        }
        footer={
          totalElements > 0 && (
            <NextPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalElements}
              itemsPerPage={size}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
              className='bg-slate-50/20'
            />
          )
        }
      >
        <DataTable
          columns={columns}
          data={paginatedProducts}
          isLoading={isFetching}
          emptyState={{
            title: 'Không tìm thấy sản phẩm',
            description: 'Thử thay đổi bộ lọc hoặc thêm sản phẩm mới.',
            icon: <Package className='h-10 w-10 text-blue-500 opacity-80' />,
            iconColor: 'bg-blue-50',
          }}
        />
      </DataCard>

      {/* Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingProduct(null); }}>
        <DialogContent className='sm:max-w-6xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden !pb-0'>
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className='text-xl font-bold text-slate-900'>Cập nhật sản phẩm</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin sản phẩm và các biến thể.</DialogDescription>
          </DialogHeader>

          {editingProduct && (
            isDetailFetching ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <ProductForm
                onSuccess={() => {
                  setIsFormOpen(false);
                  setEditingProduct(null);
                  toast.success('Cập nhật thành công (Demo)');
                }}
                initialData={{
                  name: activeProduct!.name,
                  sku: activeProduct!.sku,
                  brand: activeProduct!.brand || '',
                  categoryId: activeProduct!.categoryId,
                  isPublished: activeProduct!.isPublished ?? (activeProduct as any).published,
                  description: activeProduct!.description || '',
                  slug: activeProduct!.slug || '',
                  images: (activeProduct as any).images || [],
                  specifications: (activeProduct as any).specifications || [],

                  metaTitle: (activeProduct as any).metaTitle || '',
                  metaDescription: (activeProduct as any).metaDescription || '',
                  metaKeywords: (activeProduct as any).metaKeywords || '',
                  variants: activeProduct!.variants?.map(v => ({
                    sku: v.sku,
                    price: v.price,
                    compareAtPrice: (v as any).compareAtPrice || 0,
                    costPrice: (v as any).costPrice || 0,
                    barcode: (v as any).barcode || '',
                    barcodeType: (v as any).barcodeType || 'EAN-13',
                    image: (v as any).image || '',
                    isActive: (v as any).isActive !== undefined ? (v as any).isActive : true,
                    attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })) as any
                  })) || [{ sku: activeProduct!.sku, price: activeProduct!.price, compareAtPrice: 0, costPrice: 0, barcode: '', barcodeType: 'EAN-13', image: '', isActive: true, attributes: [] }],
                }}
                isDialog={true}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => { setDeleteConfirmId(null); toast.success('Tính năng xóa đang được phát triển (API chưa sẵn sàng)'); }}
        description="Bạn có chắc chắn muốn xóa sản phẩm này? (Tính năng Demo)"
      />
    </div>
  );
}
