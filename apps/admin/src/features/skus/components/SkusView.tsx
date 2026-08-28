'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Layers } from 'lucide-react';

import {
  Badge,
  NextPagination,
  PageHeader,
  DataTable,
  DataCard,
  type ColumnDef,
  Breadcrumbs,
} from '@/components/common';
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
import SkuDetailDialog from './SkuDetailDialog';

import { Sku } from '../types/sku.interface';
import { PageResponse } from '@/types/pagination';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { getSortOptions } from '@/types';
import { cn } from '@/lib/utils';

import { useSkus } from '../hooks/use-skus';

export default function SkusView() {
  const {
    sort,
    searchParams,
    updateUrl,
    setSort,
    page,
    size,
    setPage,
    setSize,
  } = useViewParams('skuCode,asc');

  const skuParam = searchParams.get('sku') || '';
  const activeParam = searchParams.get('active');

  const { data: skusResponse, isFetching, refetch } = useSkus({
    page,
    size,
    sort,
    search: skuParam,
    isActive: activeParam ? activeParam === 'true' : undefined,
  });

  const rawData = skusResponse?.data;
  const apiSkus = Array.isArray(rawData)
    ? rawData
    : Array.isArray((rawData as any)?.data)
      ? (rawData as any).data
      : [];
  const pagination = skusResponse?.pagination || (rawData as any)?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.totalElements || apiSkus.length;

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useDebounceSearch(skuParam, (val) => updateUrl({ sku: val, page: 1 }));

  const handleViewDetail = useCallback((sku: Sku) => {
    setSelectedSku(sku);
    setIsDetailOpen(true);
  }, []);

  const [isExporting, setIsExporting] = useState(false);

  const handleCreate = useCallback(() => {
    toast.info('Tính năng Thêm mới SKU đang được phát triển');
  }, []);

  useHotkeys('+', handleCreate);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất file thành công (Demo)');
      setIsExporting(false);
    }, 1000);
  }, []);

  const sortOptions = useMemo(() => getSortOptions(['SKU', 'PRICE']), []);

  const columns: ColumnDef<Sku>[] = useMemo(() => [
    {
      header: 'Mã SKU',
      accessorKey: 'skuCode',
      className: 'font-mono text-[11px] font-bold text-blue-600',
    },
    {
      header: 'Mã vạch',
      cell: (sku) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{sku.barcode || 'N/A'}</span>
          {sku.barcodeType && <span className="text-[10px] text-slate-500">{sku.barcodeType}</span>}
        </div>
      )
    },
    {
      header: 'Sản phẩm',
      accessorKey: 'productName',
      className: 'text-sm font-medium',
    },
    {
      header: 'Biến thể',
      accessorKey: 'variantName',
      className: 'text-sm',
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (sku) => (
        <Badge variant={sku.active ? 'default' : 'secondary'} className='text-[10px] py-0.5 px-2 border-none whitespace-nowrap'>
          {sku.active ? 'Hoạt động' : 'Tạm ngừng'}
        </Badge>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (sku) => (
        <div className='flex justify-end gap-1'>
          <ViewActionButton onClick={() => handleViewDetail(sku)} disabled={isExporting} />
          <EditActionButton onClick={() => toast.info('Tính năng Chỉnh sửa đang được phát triển (Demo)')} disabled={isExporting} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(sku.id)} disabled={isExporting} />
        </div>
      ),
    },
  ], [handleViewDetail, isExporting]);

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
    { label: 'Danh sách SKU', icon: Layers },
  ];

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader title='Quản lý SKUs' description='Xem và quản lý các đơn vị hàng hóa chi tiết (Stock Keeping Units).' actions={commonActions} />

      <DataCard
        search={<SearchInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm mã SKU...' />}
        extra={
          <>
            <FilterPopover 
              activeCount={activeParam ? 1 : 0}
              onClear={() => updateUrl({ active: '', page: 1 })}
              disabled={isExporting}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-xs leading-none">Trạng thái</h4>
                <div className="flex flex-col gap-1">
                  <button className={filterBtnClass(!activeParam)} onClick={() => updateUrl({ active: '', page: 1 })}>
                    Tất cả trạng thái
                  </button>
                  <button className={filterBtnClass(activeParam === 'true')} onClick={() => updateUrl({ active: 'true', page: 1 })}>
                    <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-blue-500' /> Hoạt động
                  </button>
                  <button className={filterBtnClass(activeParam === 'false')} onClick={() => updateUrl({ active: 'false', page: 1 })}>
                    <Badge variant='secondary' className='mr-2 h-2 w-2 rounded-full p-0' /> Tạm ngừng
                  </button>
                </div>
              </div>
            </FilterPopover>

            <SortPopover options={sortOptions} currentValue={sort} onSelect={setSort} disabled={isExporting} />
          </>
        }
        footer={
          (isFetching || totalItems > 0) && (
            <NextPagination 
              isLoading={isFetching}
              currentPage={page} 
              totalPages={totalPages} 
              totalItems={totalItems} 
              itemsPerPage={size} 
              onItemsPerPageChange={setSize} 
              onPageChange={setPage} 
            />
          )
        }
      >
        <DataTable
          columns={columns}
          data={apiSkus}
          isLoading={isFetching}
          emptyState={{
            title: 'Không tìm thấy mã SKU',
            description: 'Vui lòng cấu hình sản phẩm để hệ thống tự động sinh mã SKU.',
            icon: <Layers className='h-10 w-10 text-blue-500 opacity-80' />,
            iconColor: 'bg-blue-50',
          }}
        />
      </DataCard>

      <SkuDetailDialog 
        sku={selectedSku}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <DeleteConfirmDialog 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => { setDeleteConfirmId(null); toast.success('Tính năng xóa đang được phát triển (Demo)'); refetch(); }} 
        description="Bạn có chắc chắn muốn xóa mã SKU này? (Tính năng Demo)"
      />
    </div>
  );
}
