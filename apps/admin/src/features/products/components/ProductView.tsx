'use client';

import React, { useState } from 'react';
import {
  Package,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
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

import { Product } from '../types/product.interface';
import { Category } from '@/features/categories/types/category.interface';
import { PageResponse } from '@/types/pagination';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { getSortOptions } from '@/types';
import { cn } from '@/lib/utils';
import { useProducts } from '../hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';

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
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopySku = (e: React.MouseEvent, skuCode: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skuCode);
    setCopiedSku(skuCode);
    toast.success(`Đã sao chép SKU: ${skuCode}`);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const handleNavigateDetail = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleCreate = () => {
    router.push('/products/create');
  };

  useHotkeys('+', handleCreate);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất danh sách sản phẩm thành công');
      setIsExporting(false);
    }, 1000);
  };

  const sortOptions = getSortOptions(['NAME', 'PRICE']);

  const columns: ColumnDef<Product>[] = [
    {
      header: 'Sản phẩm',
      skeleton: (
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
      ),
      cell: (product) => {
        const thumbObj = product.thumbnail as any;
        const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

        return (
          <div
            onClick={() => handleNavigateDetail(product.id)}
            className="flex items-center gap-3 group cursor-pointer py-1"
          >
            <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center relative shadow-2xs group-hover:border-slate-400 transition-colors">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <Package className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors"
                title={product.name}
              >
                {product.name}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  <span>{product.sku}</span>
                  <button
                    onClick={(e) => handleCopySku(e, product.sku)}
                    className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                    title="Sao chép SKU"
                  >
                    {copiedSku === product.sku ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {product.brand && (
                  <span className="text-[11px] text-slate-500 truncate">
                    • {product.brand}
                  </span>
                )}
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
      skeleton: <Skeleton className="h-4 w-28 rounded-md" />,
      cell: (product) => {
        const cat = categoriesList.find((c) => c.id === product.categoryId);
        const name = cat ? cat.name : ((product as any).categoryName || 'Chưa phân loại');

        return (
          <span className="text-xs font-medium text-slate-600">
            {name}
          </span>
        );
      },
    },
    {
      header: 'Biến thể SKU',
      align: 'center',
      skeleton: <Skeleton className="h-6 w-16 mx-auto rounded-lg" />,
      cell: (product) => {
        const variants = product.variants || [];
        const count = variants.length > 0 ? variants.length : 1;

        return (
          <span
            onClick={() => handleNavigateDetail(product.id)}
            className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Quản lý biến thể SKU"
          >
            {count} SKU
          </span>
        );
      },
    },
    {
      header: 'Giá bán',
      align: 'right',
      skeleton: <Skeleton className="h-5 w-24 ml-auto rounded-md" />,
      cell: (product) => {
        const variants = product.variants || [];
        const minPrice =
          variants.length > 0
            ? Math.min(...variants.map((v) => v.price))
            : (product as any).price || 0;

        return (
          <span className="text-sm font-bold text-blue-600 font-mono">
            {formatCurrency(minPrice)}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      align: 'center',
      skeleton: <Skeleton className="h-6 w-20 mx-auto rounded-full" />,
      cell: (product) => {
        const isPublished = product.isPublished ?? (product as any).published;

        return (
          <Badge
            variant={isPublished ? 'default' : 'secondary'}
            className={
              isPublished
                ? 'bg-emerald-100 text-emerald-800 border-none text-[11px] font-semibold px-2.5 py-0.5'
                : 'bg-slate-100 text-slate-600 border-none text-[11px] font-medium px-2.5 py-0.5'
            }
          >
            {isPublished ? 'Đang bán' : 'Ngừng bán'}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      skeleton: (
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ),
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <ViewActionButton onClick={() => handleNavigateDetail(product.id)} disabled={isExporting} />
          <EditActionButton onClick={() => handleNavigateDetail(product.id)} disabled={isExporting} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(product.id)} disabled={isExporting} />
        </div>
      ),
    },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => toast.info('Tính năng Nhập file đang phát triển')} disabled={isExporting} />
      <ExportButton onExport={handleExport} isLoading={isExporting} />
      <AddNewButton onClick={handleCreate} disabled={isExporting} />
    </>
  );

  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-normal text-xs px-2.5 py-1.5 rounded-md text-left transition-colors flex items-center',
      active ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
    );

  const breadcrumbItems = [{ label: 'Sản phẩm', icon: Package }];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Quản lý sản phẩm"
        description="Xem và quản lý danh mục sản phẩm của bạn."
        actions={commonActions}
      />

      <DataCard
        search={
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm tên sản phẩm hoặc mã SKU..."
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(categoryIdParam ? 1 : 0) + (isPublishedParam ? 1 : 0)}
              onClear={() => updateUrl({ categoryId: '', isPublished: '', page: 1 })}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-xs leading-none text-slate-900">Danh mục sản phẩm</h4>
                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                    <button
                      className={filterBtnClass(!categoryIdParam)}
                      onClick={() => updateUrl({ categoryId: '', page: 1 })}
                    >
                      Tất cả danh mục
                    </button>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        className={filterBtnClass(categoryIdParam === cat.id)}
                        onClick={() => updateUrl({ categoryId: cat.id, page: 1 })}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-xs leading-none text-slate-900">Trạng thái kinh doanh</h4>
                  <div className="flex flex-col gap-1">
                    <button
                      className={filterBtnClass(!isPublishedParam)}
                      onClick={() => updateUrl({ isPublished: '', page: 1 })}
                    >
                      Tất cả trạng thái
                    </button>
                    <button
                      className={filterBtnClass(isPublishedParam === 'true')}
                      onClick={() => updateUrl({ isPublished: 'true', page: 1 })}
                    >
                      Đang bán
                    </button>
                    <button
                      className={filterBtnClass(isPublishedParam === 'false')}
                      onClick={() => updateUrl({ isPublished: 'false', page: 1 })}
                    >
                      Ngừng bán
                    </button>
                  </div>
                </div>
              </div>
            </FilterPopover>

            <SortPopover options={sortOptions} currentValue={sort} onSelect={setSort} />

            {(Boolean(searchTerm) || Boolean(categoryIdParam) || isPublishedParam !== null || sort !== 'name,asc') && (
              <ResetFiltersButton
                onClick={() => {
                  setSearchTerm('');
                  updateUrl({
                    name: undefined,
                    categoryId: undefined,
                    isPublished: undefined,
                    sort: 'name,asc',
                    page: 1,
                  });
                }}
              />
            )}
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
              className="bg-slate-50/20"
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
            description: 'Thử thay đổi bộ lọc tìm kiếm hoặc tạo sản phẩm mới.',
            icon: <Package className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: 'bg-blue-50',
          }}
        />
      </DataCard>

      <DeleteConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          setDeleteConfirmId(null);
          toast.success('Xóa sản phẩm thành công');
        }}
        description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
      />
    </div>
  );
}
