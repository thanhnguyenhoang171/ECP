'use client';

import React, { useState } from 'react';
import { Layers } from 'lucide-react';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  NextPagination,
  PageHeader,
  DataTable,
  DataCard,
  type ColumnDef,
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
  DeleteConfirmDialog,
} from '@/components/common/view-control';

import { Sku } from '../types/sku.interface';
import { PageResponse } from '@/types/pagination';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/formatters';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { getSortOptions } from '@/types';
import { cn } from '@/lib/utils';

interface SkusViewProps {
  initialData: PageResponse<Sku>;
}

export default function SkusView({
  initialData,
}: SkusViewProps) {
  const {
    sort,
    searchParams,
    updateUrl,
    setSort,
  } = useViewParams('sku,asc');

  const skuParam = searchParams.get('sku') || '';
  const activeParam = searchParams.get('active');

  // local state cho dữ liệu demo
  const [skus, setSkus] = useState<Sku[]>(initialData.data);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Sử dụng useMemo để tính toán filteredSkus thay vì useEffect + useState
  const filteredSkus = React.useMemo(() => {
    let result = [...skus];
    if (skuParam) result = result.filter(s => s.sku.toLowerCase().includes(skuParam.toLowerCase()));
    if (activeParam) {
      const active = activeParam === 'true';
      result = result.filter(s => s.active === active);
    }
    return result;
  }, [skuParam, activeParam, skus]);

  const [searchTerm, setSearchTerm] = useDebounceSearch(skuParam, (val) => updateUrl({ sku: val, page: 0 }));

  const [isExporting, setIsExporting] = useState(false);

  const handleCreate = () => {
    toast.info('Tính năng Thêm mới đang được phát triển (Demo)');
  };

  useHotkeys('+', handleCreate);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất file thành công (Demo)');
      setIsExporting(false);
    }, 1000);
  };

  const sortOptions = getSortOptions(['SKU', 'PRICE']);

  const columns: ColumnDef<Sku>[] = [
    {
      header: 'Mã SKU',
      accessorKey: 'sku',
      className: 'font-mono text-[11px] font-bold text-blue-600',
    },
    {
      header: 'Sản phẩm',
      accessorKey: 'productName',
      className: 'text-sm font-medium',
    },
    {
      header: 'Biến thể / Thuộc tính',
      cell: (sku) => (
        <div className='flex flex-wrap gap-1'>
          {Object.entries(sku.attributes).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-[10px] font-normal border-slate-200 text-slate-500">
              {key}: {value}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Giá bán',
      align: 'right',
      cell: (sku) => formatCurrency(sku.price),
      className: 'text-sm font-bold',
    },
    {
      header: 'Tồn kho',
      align: 'center',
      cell: (sku) => (
        <Badge variant='secondary' className='text-[10px] py-0.5 px-2 bg-slate-100 text-slate-600 border-none whitespace-nowrap'>
          {sku.stock}
        </Badge>
      ),
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
          <EditActionButton onClick={() => toast.info('Tính năng Chỉnh sửa đang được phát triển (Demo)')} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(sku.id)} />
        </div>
      ),
    },
  ];

  const commonActions = (
    <>
      <ImportButton onClick={() => toast.info('Tính năng Nhập file đang được phát triển (Demo)')} />
      <ExportButton onExport={handleExport} isLoading={isExporting} />
      <AddNewButton onClick={() => toast.info('Tính năng Thêm mới đang được phát triển (Demo)')} />
    </>
  );

  const filterBtnClass = (active: boolean) => cn(
    "justify-start font-normal text-xs px-2 py-1.5 rounded-md text-left transition-colors flex items-center",
    active ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-500"
  );

  return (
    <div className='space-y-6'>
      <PageHeader title='Quản lý SKUs' description='Xem và quản lý các đơn vị hàng hóa chi tiết (Stock Keeping Units).' actions={commonActions} />

      <DataCard
        search={<SearchInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm mã SKU...' />}
        extra={
          <>
            <FilterPopover 
              activeCount={activeParam ? 1 : 0}
              onClear={() => updateUrl({ active: '', page: 0 })}
            >
              <div className="space-y-2">
                <h4 className="font-medium text-xs leading-none">Trạng thái</h4>
                <div className="flex flex-col gap-1">
                  <button className={filterBtnClass(!activeParam)} onClick={() => updateUrl({ active: '', page: 0 })}>
                    Tất cả trạng thái
                  </button>
                  <button className={filterBtnClass(activeParam === 'true')} onClick={() => updateUrl({ active: 'true', page: 0 })}>
                    <Badge className='mr-2 h-2 w-2 rounded-full p-0 bg-blue-500' /> Hoạt động
                  </button>
                  <button className={filterBtnClass(activeParam === 'false')} onClick={() => updateUrl({ active: 'false', page: 0 })}>
                    <Badge variant='secondary' className='mr-2 h-2 w-2 rounded-full p-0' /> Tạm ngừng
                  </button>
                </div>
              </div>
            </FilterPopover>

            <SortPopover options={sortOptions} currentValue={sort} onSelect={setSort} />
          </>
        }
        footer={
          filteredSkus.length > 0 && (
            <NextPagination 
              currentPage={1} 
              totalPages={1} 
              totalItems={filteredSkus.length} 
              itemsPerPage={10} 
              onItemsPerPageChange={() => {}} 
              onPageChange={() => {}} 
              className='bg-slate-50/20' 
            />
          )
        }
      >
        <DataTable
          columns={columns}
          data={filteredSkus}
          emptyState={{
            title: 'Không tìm thấy mã SKU',
            description: 'Vui lòng cấu hình sản phẩm để hệ thống tự động sinh mã SKU.',
            icon: <Layers className='h-10 w-10 text-blue-500 opacity-80' />,
            iconColor: 'bg-blue-50',
          }}
        />
      </DataCard>

      <DeleteConfirmDialog 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => { setSkus(skus.filter(s => s.id !== deleteConfirmId)); setDeleteConfirmId(null); toast.success('Đã xóa SKU (Demo)'); }} 
        description="Bạn có chắc chắn muốn xóa mã SKU này? (Tính năng Demo)"
      />
    </div>
  );
}
