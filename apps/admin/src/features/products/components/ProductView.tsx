'use client';

import React, { useState } from 'react';
import { Package } from 'lucide-react';

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

import { Product } from '../types/product.interface';
import { Category } from '@/features/categories/types/category.interface';
import { PageResponse } from '@/types/pagination';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { getSortOptions } from '@/types';
import { cn } from '@/lib/utils';

import ProductForm from './ProductForm';

interface ProductViewProps {
  initialData: PageResponse<Product>;
  categories: Category[];
}

export default function ProductView({
  initialData,
  categories,
}: ProductViewProps) {
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

  // local state cho dữ liệu demo
  const [products, setProducts] = useState<Product[]>(initialData.data);
  
  const [searchTerm, setSearchTerm] = useDebounceSearch(name, (val) => updateUrl({ name: val, page: 1 }));

  // Sử dụng useMemo để tính toán filteredProducts thay vì useEffect + useState
  const filteredProducts = React.useMemo(() => {
    let result = [...products];
    if (name) result = result.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (categoryIdParam) result = result.filter(p => p.categoryId === categoryIdParam);
    if (isPublishedParam) {
      const isPublished = isPublishedParam === 'true';
      result = result.filter(p => p.isPublished === isPublished);
    }
    return result;
  }, [name, categoryIdParam, isPublishedParam, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / size));
  const paginatedProducts = filteredProducts.slice((page - 1) * size, page * size);

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
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
      header: 'Mã SKU',
      accessorKey: 'sku',
      className: 'font-mono text-[11px] font-bold text-slate-400',
      headerClassName: 'w-20',
    },
    {
      header: 'Tên sản phẩm',
      cell: (product) => (
        <div className='flex flex-col'>
          <span className='text-sm font-bold'>{product.name}</span>
          <span className='text-[11px] opacity-60'>{product.brand}</span>
        </div>
      ),
    },
    {
      header: 'Danh mục',
      accessorKey: 'categoryName',
      className: 'text-sm hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
    },
    {
      header: 'Giá',
      align: 'right',
      cell: (product) => formatCurrency(product.price),
      className: 'text-sm font-bold text-blue-600',
    },
    {
      header: 'Tồn kho',
      align: 'center',
      cell: (product) => (
        <Badge variant='secondary' className='text-[10px] py-0.5 px-2 bg-slate-100 text-slate-600 border-none whitespace-nowrap'>
          {product.stock}
        </Badge>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (product) => (
        <Badge variant={product.isPublished ? 'default' : 'secondary'} className='text-[10px] py-0.5 px-2 border-none whitespace-nowrap'>
          {product.isPublished ? 'Đang bán' : 'Ngừng bán'}
        </Badge>
      ),
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

  return (
    <div className='space-y-6'>
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
                    {categories.map((cat) => (
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
          filteredProducts.length > 0 && (
            <NextPagination 
              currentPage={page} 
              totalPages={totalPages} 
              totalItems={filteredProducts.length} 
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
        <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-slate-900'>{editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</DialogTitle>
            <DialogDescription>{editingProduct ? 'Chỉnh sửa thông tin sản phẩm và các biến thể.' : 'Nhập thông tin sản phẩm và các biến thể kho hàng.'}</DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
              toast.success(editingProduct ? 'Cập nhật thành công (Demo)' : 'Tạo mới thành công (Demo)');
            }}
            initialData={editingProduct ? {
              name: editingProduct.name,
              sku: editingProduct.sku,
              brand: editingProduct.brand || '',
              categoryId: editingProduct.categoryId,
              isPublished: editingProduct.isPublished,
              description: editingProduct.description || '',
              variants: editingProduct.variants?.map(v => ({
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                attributes: v.attributes || {}
              })) || [{ sku: editingProduct.sku, price: editingProduct.price, stock: editingProduct.stock, attributes: {} }],
              slug: editingProduct.slug || ''
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => { setProducts(products.filter(p => p.id !== deleteConfirmId)); setDeleteConfirmId(null); toast.success('Đã xóa (Demo)'); }} 
        description="Bạn có chắc chắn muốn xóa sản phẩm này? (Tính năng Demo)"
      />
    </div>
  );
}
