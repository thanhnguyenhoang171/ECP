'use client';

import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

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
  Button,
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
import { cn } from '@/lib/utils';

interface ProductViewProps {
  initialData: PageResponse<Product>;
  categories: Category[];
}

export default function ProductView({
  initialData,
  categories,
}: ProductViewProps) {
  const {
    page,
    size,
    sort,
    name,
    updateUrl,
    setPage,
    setSize,
    setSort,
    setSearch,
    searchParams,
  } = useViewParams('name,asc');

  const categoryIdParam = searchParams.get('categoryId') || '';
  const isPublishedParam = searchParams.get('isPublished');

  // local state cho dữ liệu demo
  const [products, setProducts] = useState<Product[]>(initialData.data);
  
  const [searchTerm, setSearchTerm] = useDebounceSearch(name, setSearch);

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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất file thành công (Demo)');
      setIsExporting(false);
    }, 1000);
  };

  const sortOptions = [
    { label: 'Tên (A-Z)', value: 'name,asc' },
    { label: 'Tên (Z-A)', value: 'name,desc' },
    { label: 'Giá giảm dần', value: 'price,desc' },
    { label: 'Giá tăng dần', value: 'price,asc' },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => toast.info('Tính năng Nhập file đang được phát triển (Demo)')} />
      <ExportButton onExport={handleExport} isLoading={isExporting} />
      <AddNewButton onClick={handleCreate} />
    </>
  );

  const filterBtnClass = (active: boolean) => cn(
    "justify-start font-normal text-xs px-2 py-1.5 rounded-md text-left transition-colors flex items-center",
    active ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-500"
  );

  return (
    <div className='space-y-6'>
      <PageHeader title='Quản lý sản phẩm' description='Xem và quản lý danh mục sản phẩm của bạn.' actions={commonActions} />

      <Card className='shadow-sm border-slate-100 overflow-hidden'>
        <CardHeader className='pb-4 bg-slate-50/30 border-b border-slate-50'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm tên sản phẩm...' />
            
            <div className='flex items-center gap-2'>
              <FilterPopover 
                activeCount={(categoryIdParam ? 1 : 0) + (isPublishedParam ? 1 : 0)}
                onClear={() => updateUrl({ categoryId: '', isPublished: '', page: 0 })}
              >
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-xs leading-none'>Danh mục</h4>
                    <div className='flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar'>
                      <button className={filterBtnClass(!categoryIdParam)} onClick={() => updateUrl({ categoryId: '', page: 0 })}>
                        Tất cả danh mục
                      </button>
                      {categories.map((cat) => (
                        <button key={cat.id} className={filterBtnClass(categoryIdParam === cat.id)} onClick={() => updateUrl({ categoryId: cat.id, page: 0 })}>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='font-medium text-xs leading-none'>Trạng thái</h4>
                    <div className='flex flex-col gap-1'>
                      <button className={filterBtnClass(!isPublishedParam)} onClick={() => updateUrl({ isPublished: '', page: 0 })}>
                        Tất cả trạng thái
                      </button>
                      <button className={filterBtnClass(isPublishedParam === 'true')} onClick={() => updateUrl({ isPublished: 'true', page: 0 })}>
                        <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-blue-500' /> Đang bán
                      </button>
                      <button className={filterBtnClass(isPublishedParam === 'false')} onClick={() => updateUrl({ isPublished: 'false', page: 0 })}>
                        <Badge variant='secondary' className='mr-2 h-2 w-2 rounded-full p-0' /> Ngừng bán
                      </button>
                    </div>
                  </div>
                </div>
              </FilterPopover>

              <SortPopover options={sortOptions} currentValue={sort} onSelect={setSort} />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0 relative'>
          {filteredProducts.length === 0 ? (
            <div className='py-20'>
              <EmptyState title='Không tìm thấy sản phẩm' description='Thử thay đổi bộ lọc hoặc thêm sản phẩm mới.' icon={<Package className='h-10 w-10 text-blue-500 opacity-80' />} iconColor='bg-blue-50' />
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader className='bg-slate-50/50'>
                    <TableRow>
                      <TableHead className='text-[11px] font-bold uppercase py-4 px-6 w-20 text-slate-500'>Mã SKU</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-slate-500'>Tên sản phẩm</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-slate-500 hidden md:table-cell'>Danh mục</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-right text-slate-500'>Giá</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-center text-slate-500'>Tồn kho</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-center text-slate-500'>Trạng thái</TableHead>
                      <TableHead className='text-[11px] font-bold uppercase py-4 text-right pr-6 text-slate-500'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className='hover:bg-slate-50/30 transition-colors border-b border-slate-50'>
                        <TableCell className='font-mono text-[11px] font-bold py-4 px-6 text-slate-400'>{product.sku}</TableCell>
                        <TableCell className='py-4'>
                          <div className='flex flex-col'>
                            <span className='text-sm font-bold text-slate-700'>{product.name}</span>
                            <span className='text-[11px] text-slate-400'>{product.brand}</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-sm text-slate-500 py-4 hidden md:table-cell'>{product.categoryName}</TableCell>
                        <TableCell className='text-right text-sm font-bold text-blue-600 py-4'>{formatCurrency(product.price)}</TableCell>
                        <TableCell className='text-center py-4'>
                          <Badge variant='secondary' className='text-[10px] h-5 px-2 bg-slate-100 text-slate-600 border-none'>{product.stock}</Badge>
                        </TableCell>
                        <TableCell className='text-center py-4'>
                          <Badge variant={product.isPublished ? 'default' : 'secondary'} className='text-[10px] h-5 px-2 border-none'>{product.isPublished ? 'Đang bán' : 'Ngừng bán'}</Badge>
                        </TableCell>
                        <TableCell className='text-right py-4 pr-6'>
                          <div className='flex justify-end gap-1'>
                            <EditActionButton onClick={() => handleEdit(product)} />
                            <DeleteActionButton onClick={() => setDeleteConfirmId(product.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <NextPagination currentPage={1} totalPages={1} totalItems={filteredProducts.length} itemsPerPage={10} onItemsPerPageChange={() => {}} onPageChange={() => {}} className='bg-slate-50/20' />
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingProduct(null); }}>
        <DialogContent className='sm:max-w-125'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-slate-900'>{editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</DialogTitle>
            <DialogDescription>{editingProduct ? 'Chỉnh sửa thông tin sản phẩm và các biến thể.' : 'Nhập thông tin sản phẩm và các biến thể kho hàng.'}</DialogDescription>
          </DialogHeader>
          <div className='py-4 text-center text-slate-500 italic text-sm'>Tính năng Form đang được cập nhật (Demo mode)</div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsFormOpen(false)}>Đóng</Button>
          </DialogFooter>
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
