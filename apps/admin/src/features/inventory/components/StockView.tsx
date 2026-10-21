'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';

import React, { useState, useMemo, useCallback } from 'react';
import { Database, Warehouse, RefreshCw, Info, Download, Loader2, ScanBarcode } from "lucide-react";
import {
  PageHeader,
  DataTable,
  DataCard,
  Breadcrumbs,
  NextPagination,
  Badge,
  type ColumnDef
} from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchInput, FilterPopover, SortPopover } from '@/components/common/view-control';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useStocks, useAdjustStock } from '../hooks/use-inventory';
import { getApiErrorMessage, isForbiddenError } from '@/constants/errorMessages';

import { formatDate, formatDateTimeForFilename } from '@/lib/formatters';
import { BarcodeScannerDialog } from './BarcodeScannerDialog';
import { inventoryApi } from '../api/inventory.api';

interface StockItem {
  id: string;
  sku: string;
  skuId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  batchCode?: string;
  manufactureDate?: string;
  expiryDate?: string;
  quantityOnHand: number;
  quantityLocked: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  costPrice: number;
  price: number;
  updatedAt?: string;
}

export default function StockView() : React.JSX.Element {
  const { data: apiStocks, isLoading, error, refetch } = useStocks();
  const isForbidden = isForbiddenError(error);

  const adjustMutation = useAdjustStock();
  const stockItems = useMemo<StockItem[]>(() => (apiStocks ?? []).map((item) => ({
    ...item, sku: item.skuCode, skuId: item.skuId,
    quantityAvailable: item.quantityOnHand - item.quantityLocked,
    lowStockThreshold: 5, costPrice: item.costPrice ?? 0, price: item.price ?? 0,
  })), [apiStocks]);


  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('sku,asc');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // Adjustment Modal state
  const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('check');

  // Filters logic
  const filteredItems = useMemo(() => {
    let items = [...stockItems];

    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          (item.batchCode && item.batchCode.toLowerCase().includes(term))
      );
    }

    if (selectedWarehouse !== 'all') {
      items = items.filter((item) => item.warehouseId === selectedWarehouse);
    }

    if (selectedStatus !== 'all') {
      items = items.filter((item) => {
        if (selectedStatus === 'low') {
          return item.quantityOnHand > 0 && item.quantityOnHand <= item.lowStockThreshold;
        }
        if (selectedStatus === 'out') {
          return item.quantityOnHand === 0;
        }
        if (selectedStatus === 'ok') {
          return item.quantityOnHand > item.lowStockThreshold;
        }
        return true;
      });
    }

    // Sort logic
    const [field, direction] = sortOption.split(',');
    items.sort((a, b) => {
      const valA = a[field as keyof StockItem];
      const valB = b[field as keyof StockItem];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? Number(valA ?? 0) - Number(valB ?? 0) : Number(valB ?? 0) - Number(valA ?? 0);
    });

    return items;
  }, [stockItems, searchTerm, selectedWarehouse, selectedStatus, sortOption]);

  const paginatedItems = useMemo(() => {
    const start = Math.min(page - 1, Math.max(0, Math.ceil(filteredItems.length / size) - 1)) * size;
    return filteredItems.slice(start, start + size);
  }, [filteredItems, page, size]);

  const totalPages = Math.ceil(filteredItems.length / size) || 1;

  // Statistics summaries
  const stats = useMemo(() => {
    let totalStock = 0;
    let totalLocked = 0;
    let totalAvailable = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    stockItems.forEach((item) => {
      totalStock += item.quantityOnHand;
      totalLocked += item.quantityLocked;
      totalAvailable += item.quantityAvailable;
      if (item.quantityOnHand === 0) {
        outOfStockCount++;
      } else if (item.quantityOnHand <= item.lowStockThreshold) {
        lowStockCount++;
      }
    });

    return { totalStock, totalLocked, totalAvailable, lowStockCount, outOfStockCount };
  }, [stockItems]);

  const handleExport = async (): Promise<void> => {
    if (isExporting) { return; }
    setIsExporting(true);
    try {
      const file = await inventoryApi.exportStocks({ warehouseId: selectedWarehouse,
        keyword: searchTerm, stockStatus: selectedStatus, sort: sortOption });
      const url = URL.createObjectURL(file);
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = `doi-soat-ton-kho_${formatDateTimeForFilename()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
      toast.success('Đã tải file Excel tồn kho để đối soát');
    } catch (cause: unknown) {
      toast.error(getApiErrorMessage(cause, 'Xuất tồn kho thất bại'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdjustClick = useCallback((item: StockItem) => {
    setAdjustingItem(item);
    setAdjustType('add');
    setAdjustQty(0);
    setAdjustReason('check');
  }, []);

  const handleAdjustSubmit = (): void => {
    if (!adjustingItem || adjustMutation.isPending) { return; }
    const quantityDelta = adjustType === 'set' ? adjustQty - adjustingItem.quantityOnHand
      : adjustType === 'subtract' ? -adjustQty : adjustQty;
    if (!Number.isSafeInteger(adjustQty) || adjustQty < 0 || quantityDelta === 0) {
      toast.error('Nhập số lượng nguyên hợp lệ và khác số lượng hiện tại');
      return;
    }
    if (adjustingItem.quantityOnHand + quantityDelta < adjustingItem.quantityLocked) {
      toast.error('Số lượng tồn sau điều chỉnh không được thấp hơn số lượng đang giữ');
      return;
    }
    const reasons: Record<string, string> = { check: 'Kiểm kê kho', restock: 'Nhập bổ sung', damaged: 'Hàng lỗi / Hỏng hóc', other: 'Điều chỉnh khác' };
    adjustMutation.mutate({ warehouseId: adjustingItem.warehouseId, skuId: adjustingItem.skuId,
      batchCode: adjustingItem.batchCode, quantityDelta, reason: reasons[adjustReason],
      expectedQuantityOnHand: adjustingItem.quantityOnHand,
    }, { onSuccess: () => setAdjustingItem(null) });
  };

  const columns = useMemo<ColumnDef<StockItem>[]>(() => [
    {
      header: 'Mã SKU',
      accessorKey: 'sku',
      className: 'w-[12%] min-w-[100px]',
      headerClassName: 'w-[12%] min-w-[100px]',
      cell: (item: StockItem) => (
        <span className="font-mono text-xs font-bold text-blue-600">
          {item.sku}
        </span>
      ),
    },
    {
      header: 'Sản phẩm & Chi tiết Lô',
      className: 'w-[24%] min-w-[180px]',
      headerClassName: 'w-[24%] min-w-[180px]',
      cell: (item: StockItem) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{item.productName}</span>
          {item.batchCode && (
            <span className="text-[10px] font-mono text-slate-500">Lô: {item.batchCode}</span>
          )}
          {(item.manufactureDate || item.expiryDate) && (
            <span className="text-[10px] text-slate-400">
              {item.expiryDate ? `HSD: ${formatDate(item.expiryDate)}` : `NSX: ${formatDate(item.manufactureDate)}`}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Kho hàng',
      accessorKey: 'warehouseName',
      className: 'w-[16%] min-w-[130px]',
      headerClassName: 'w-[16%] min-w-[130px]',
      cell: (item: StockItem) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Warehouse size={13} className="text-slate-400" />
          {item.warehouseName}
        </div>
      ),
    },
    {
      header: 'Tồn thực tế (OnHand)',
      align: 'center' as const,
      className: 'w-[13%] min-w-[120px]',
      headerClassName: 'w-[13%] min-w-[120px]',
      cell: (item: StockItem) => {
        const isOutOfStock = item.quantityOnHand === 0;
        const isLowStock = item.quantityOnHand > 0 && item.quantityOnHand <= item.lowStockThreshold;

        return (
          <div className="flex flex-col items-center">
            <Badge
              className={cn(
                "text-[11px] py-0.5 px-2.5 font-bold border-none shadow-none whitespace-nowrap",
                isOutOfStock && "bg-red-100 text-red-700",
                isLowStock && "bg-amber-100 text-amber-700",
                !isOutOfStock && !isLowStock && "bg-emerald-100 text-emerald-700"
              )}
            >
              {item.quantityOnHand} sản phẩm
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Đang khóa (Locked)',
      align: 'center' as const,
      className: 'w-[10%] min-w-[90px]',
      headerClassName: 'w-[10%] min-w-[90px]',
      cell: (item: StockItem) => (
        <span className={cn(
          "text-xs font-semibold font-mono",
          item.quantityLocked > 0 ? "text-amber-600 font-bold" : "text-slate-400"
        )}>
          {item.quantityLocked}
        </span>
      ),
    },
    {
      header: 'Tồn khả dụng (Available)',
      align: 'center' as const,
      className: 'w-[12%] min-w-[110px]',
      headerClassName: 'w-[12%] min-w-[110px]',
      cell: (item: StockItem) => (
        <span className="text-xs font-bold font-mono text-emerald-600">
          {item.quantityAvailable}
        </span>
      ),
    },
    {
      header: 'Cập nhật',
      align: 'center' as const,
      className: 'w-[8%] min-w-[80px]',
      headerClassName: 'w-[8%] min-w-[80px]',
      cell: (item: StockItem) => (
        <span className="text-[11px] text-slate-400">
          {item.updatedAt ? formatDate(item.updatedAt) : '---'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      className: 'w-[5%] min-w-[90px]',
      headerClassName: 'w-[5%] min-w-[90px]',
      cell: (item: StockItem) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border-slate-200"
          onClick={() => handleAdjustClick(item)}
        >
          <RefreshCw size={12} /> Điều chỉnh
        </Button>
      ),
    },
  ], [handleAdjustClick]);

  const breadcrumbItems = [
    { label: 'Tồn kho', icon: Database },
  ];

  const warehouses = [
    { id: 'wh-1', name: 'Kho Chính Quận 1' },
    { id: 'wh-2', name: 'Kho Phụ Quận 7' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Quản lý tồn kho"
        description="Quản lý số lượng hàng tồn thực tế tại các kho, điều chỉnh số lượng và cảnh báo sắp hết hàng."
        actions={<><Button type='button' variant='outline' className='gap-2' onClick={() => setIsScannerOpen(true)}><ScanBarcode size={16} />Quét kiểm tra hàng</Button><Button type='button' onClick={() => { void handleExport(); }} disabled={isExporting || isLoading || Boolean(error)} className='gap-2'>
          {isExporting ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
          {isExporting ? 'Đang xuất Excel...' : 'Xuất Excel đối soát'}
        </Button></>}
      />
      <BarcodeScannerDialog open={isScannerOpen} onOpenChange={setIsScannerOpen} warehouseId={selectedWarehouse === 'all' ? undefined : selectedWarehouse} />

      <p className='text-sm text-slate-500'>File Excel xuất toàn bộ kết quả theo bộ lọc hiện tại, có cột kiểm đếm thực tế và tự tính chênh lệch.</p>
      {/* Main Stock Table */}
      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        {[
          ['Tồn thực tế', stats.totalStock], ['Tồn khả dụng', stats.totalAvailable],
          ['Đang giữ', stats.totalLocked], ['Sắp hết / Hết hàng', stats.lowStockCount + stats.outOfStockCount],
        ].map(([label, value]) => <div key={label} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
          <p className='text-xs font-semibold text-slate-500'>{label}</p><p className='mt-2 text-2xl font-bold text-slate-900'>{value}</p>
        </div>)}
      </div>
      <WarehouseRequestError error={error} retry={() => { void refetch(); }} />
      <DataCard
        search={
          <SearchInput
            value={searchTerm}
            onChange={(val) => { setSearchTerm(val); setPage(1); }}
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(selectedWarehouse !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
              onClear={() => {
                setSelectedWarehouse('all');
                setSelectedStatus('all');
                setPage(1);
              }}
            >
              <div className="space-y-4 p-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Kho hàng</Label>
                  <Select value={selectedWarehouse} onValueChange={(val) => { setSelectedWarehouse(val); setPage(1); }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả kho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả kho</SelectItem>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái tồn kho</Label>
                  <Select value={selectedStatus} onValueChange={(val) => { setSelectedStatus(val); setPage(1); }}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="ok">Đủ hàng</SelectItem>
                      <SelectItem value="low">Sắp hết hàng</SelectItem>
                      <SelectItem value="out">Hết hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={[
                { value: 'sku,asc', label: 'SKU (A-Z)' },
                { value: 'sku,desc', label: 'SKU (Z-A)' },
                { value: 'quantityOnHand,asc', label: 'Tồn kho thấp nhất' },
                { value: 'quantityOnHand,desc', label: 'Tồn kho cao nhất' },
              ]}
              currentValue={sortOption}
              onSelect={setSortOption}
            />
          </>
        }
        footer={
          !isForbidden && (isLoading || filteredItems.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              itemsPerPage={size}
              onItemsPerPageChange={(value) => { setSize(value); setPage(1); }}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable
          auditTrail
          columns={columns}
          data={paginatedItems}
          isLoading={isLoading && !filteredItems.length}
          loadingRows={size}
          isForbidden={isForbidden}
          forbiddenState={{
            title: 'Không có quyền xem tồn kho',
            description: 'Tài khoản của bạn chưa được cấp quyền xem danh sách tồn kho (inventory:read). Vui lòng liên hệ Quản trị viên để được phân quyền.',
          }}
          emptyState={{
            title: 'Không tìm thấy dòng tồn kho nào',
            description: 'Hãy kiểm tra lại điều kiện lọc hoặc nhập thêm hàng hóa.',
            icon: <Database className="h-10 w-10 text-slate-400" />,
            iconColor: 'bg-slate-50'
          }}
        />
      </DataCard>

      {/* Quick Adjust Dialog */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => { if (!open && !adjustMutation.isPending) { setAdjustingItem(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Điều chỉnh tồn kho nhanh
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thực hiện thay đổi số lượng tồn kho trực tiếp cho SKU này.
            </DialogDescription>
          </DialogHeader>

          {adjustingItem && (
            <div className="space-y-5 py-3 text-slate-700">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                <div className="text-xs font-bold font-mono text-blue-600">{adjustingItem.sku}</div>
                <div className="text-sm font-semibold text-slate-800">{adjustingItem.productName}</div>
                {adjustingItem.batchCode && <div className="text-xs text-slate-400 font-medium">Lô: {adjustingItem.batchCode}</div>}
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Kho hàng: <span className="font-bold">{adjustingItem.warehouseName}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                  Tồn kho hiện tại:
                  <Badge className="bg-slate-200 text-slate-700 font-bold border-none px-2 py-0">
                    {adjustingItem.quantityOnHand} chiếc
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Hình thức điều chỉnh</Label>
                <div className="flex gap-4">
                  {[
                    { id: 'add' as const, label: 'Tăng (+)' },
                    { id: 'subtract' as const, label: 'Giảm (-)' },
                    { id: 'set' as const, label: 'Đặt lại (=)' },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="adjustType"
                        value={option.id}
                        checked={adjustType === option.id}
                        onChange={() => setAdjustType(option.id)}
                        className="h-4 w-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Số lượng thay đổi</Label>
                  <Input
                    type="number"
                    min={0}
                    value={adjustQty || ''}
                    onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Lý do điều chỉnh</Label>
                  <Select value={adjustReason} onValueChange={setAdjustReason}>
                    <SelectTrigger className="h-10 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Kiểm kho định kỳ</SelectItem>
                      <SelectItem value="restock">Nhập bổ sung</SelectItem>
                      <SelectItem value="damaged">Hàng lỗi / Hỏng hóc</SelectItem>
                      <SelectItem value="other">Lý do khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live Preview of Result */}
              <div className="text-xs bg-blue-50/50 text-blue-700 p-3 rounded-xl border border-blue-100/50 flex items-center gap-2">
                <Info size={14} className="text-blue-500 shrink-0" />
                <span>
                  Số lượng tồn sau điều chỉnh:
                  <strong className="ml-1 font-bold">
                    {adjustType === 'add' ? adjustingItem.quantityOnHand + adjustQty :
                     adjustType === 'subtract' ? adjustingItem.quantityOnHand - adjustQty :
                     adjustQty} chiếc
                  </strong>
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setAdjustingItem(null)}>
              Hủy bỏ
            </Button>
            <Button size="sm" disabled={adjustMutation.isPending} onClick={handleAdjustSubmit} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
