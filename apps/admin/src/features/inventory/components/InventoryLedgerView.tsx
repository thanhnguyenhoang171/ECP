'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';

import React, { useState, useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs, NextPagination, type ColumnDef } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/view-control';
import { cn } from '@/lib/utils';
import { useInventoryLedgers } from '../hooks/use-inventory';
import { isForbiddenError } from '@/constants/errorMessages';

export default function InventoryLedgerView() : React.JSX.Element {
  const { data: ledgerData, isLoading, error, refetch } = useInventoryLedgers();
  const isForbidden = isForbiddenError(error);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const ledgerList = React.useMemo(() => (ledgerData ?? []).map((item) => ({ ...item,
    type: item.transactionType, referenceId: item.referenceId || '', note: item.note || '',
  })), [ledgerData]);


  const filteredLedgers = useMemo(() => ledgerList.filter((item) => {
    const matchesSearch = [item.skuCode, item.productName, item.referenceId, item.warehouseName, item.note]
      .some((value) => (value || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const day = item.createdAt.slice(0, 10);
    return matchesSearch && (warehouseFilter === 'all' || item.warehouseId === warehouseFilter)
      && (typeFilter === 'all' || item.type === typeFilter)
      && (!fromDate || day >= fromDate) && (!toDate || day <= toDate);
  }), [ledgerList, searchTerm, warehouseFilter, typeFilter, fromDate, toDate]);

  const paginatedLedgers = useMemo(() => {
    const start = Math.min(page - 1, Math.max(0, Math.ceil(filteredLedgers.length / size) - 1)) * size;
    return filteredLedgers.slice(start, start + size);
  }, [filteredLedgers, page, size]);

  const totalPages = Math.ceil(filteredLedgers.length / size) || 1;

  const columns: ColumnDef<(typeof ledgerList)[number]>[] = useMemo(() => [
    {
      accessorKey: 'createdAt',
      header: 'Thời gian',
      className: 'w-[14%] min-w-[120px]',
      headerClassName: 'w-[14%] min-w-[120px]',
      cell: (item) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      accessorKey: 'skuCode',
      header: 'Mã SKU & Lô hàng',
      className: 'w-[16%] min-w-[130px]',
      headerClassName: 'w-[16%] min-w-[130px]',
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono font-bold text-slate-800">{item.skuCode}</span>
          {item.batchCode && (
            <span className="text-[10px] text-slate-500 font-mono">Lô: {item.batchCode}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại Giao Dịch',
      align: 'center' as const,
      className: 'w-[14%] min-w-[110px]',
      headerClassName: 'w-[14%] min-w-[110px]',
      cell: (item) => {
        const isPositive = item.quantityChange > 0;
        return (
          <div className="flex items-center justify-center gap-1.5">
            {isPositive ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-rose-500" />}
            <Badge className={cn(
              "text-[10px] border-none font-bold px-2 py-0.5",
              item.type === 'INBOUND' || item.type === 'PURCHASE_RECEIPT' ? "bg-emerald-100 text-emerald-800" :
              item.type === 'OUTBOUND' || item.type === 'SALES_ISSUE' ? "bg-rose-100 text-rose-800" :
              "bg-amber-100 text-amber-800"
            )}>
              {item.type === 'INBOUND' || item.type === 'PURCHASE_RECEIPT' ? 'Nhập kho' : item.type === 'OUTBOUND' || item.type === 'SALES_ISSUE' ? 'Xuất kho' : 'Điều chỉnh'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'quantityChange',
      header: 'Thay đổi',
      align: 'right' as const,
      className: 'w-[10%] min-w-[80px]',
      headerClassName: 'w-[10%] min-w-[80px]',
      cell: (item) => (
        <span className={cn("font-bold font-mono text-xs", item.quantityChange > 0 ? "text-emerald-600" : "text-rose-600")}>
          {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
        </span>
      ),
    },
    {
      accessorKey: 'balanceAfter',
      header: 'Tồn sau GD',
      align: 'right' as const,
      className: 'w-[10%] min-w-[80px]',
      headerClassName: 'w-[10%] min-w-[80px]',
      cell: (item) => <span className="font-mono text-xs font-extrabold text-slate-800">{item.balanceAfter}</span>,
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho hàng',
      className: 'w-[14%] min-w-[110px]',
      headerClassName: 'w-[14%] min-w-[110px]',
      cell: (item) => <span className="text-xs text-slate-600">{item.warehouseName}</span>,
    },
    {
      accessorKey: 'referenceId',
      header: 'Mã chứng từ',
      className: 'w-[14%] min-w-[120px]',
      headerClassName: 'w-[14%] min-w-[120px]',
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-blue-700 border-blue-200">
            {item.referenceType}: {item.referenceId}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'note',
      header: 'Ghi chú',
      className: 'w-[8%] min-w-[90px]',
      headerClassName: 'w-[8%] min-w-[90px]',
      cell: (item) => <span className="text-xs text-slate-500 line-clamp-1">{item.note || '---'}</span>,
    },
  ], []);

  const breadcrumbItems = [
    { label: 'Sổ cái kho hàng', icon: History },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Sổ cái Kho hàng (Inventory Ledger)"
        description="Lịch sử chi tiết mọi biến động nhập, xuất và điều chỉnh tồn kho."
      />

      <WarehouseRequestError error={error} retry={() => { void refetch(); }} />
      <div className='flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4'>
        <label className='space-y-1 text-xs font-semibold text-slate-600'>Kho hàng
          <select aria-label='Lọc sổ cái theo kho' className='block rounded-lg border border-slate-200 bg-white p-2 text-sm' value={warehouseFilter} onChange={(event) => { setWarehouseFilter(event.target.value); setPage(1); }}>
            <option value='all'>Tất cả kho</option>
            {[...new Map(ledgerList.map((item) => [item.warehouseId, item.warehouseName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className='space-y-1 text-xs font-semibold text-slate-600'>Loại giao dịch
          <select aria-label='Lọc loại giao dịch' className='block rounded-lg border border-slate-200 bg-white p-2 text-sm' value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }}>
            <option value='all'>Tất cả giao dịch</option><option value='PURCHASE_RECEIPT'>Nhập kho</option><option value='STOCK_ADJUSTMENT'>Điều chỉnh</option><option value='SALES_ISSUE'>Xuất bán</option>
          </select>
        </label>
        <label className='space-y-1 text-xs font-semibold text-slate-600'>Từ ngày<input aria-label='Từ ngày' type='date' className='block rounded-lg border border-slate-200 p-2 text-sm' value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} /></label>
        <label className='space-y-1 text-xs font-semibold text-slate-600'>Đến ngày<input aria-label='Đến ngày' type='date' className='block rounded-lg border border-slate-200 p-2 text-sm' min={fromDate} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} /></label>
      </div>
      <DataCard
        search={<SearchInput placeholder="Tìm theo mã SKU, mã chứng từ..." value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />}
        footer={
          !isForbidden && (isLoading || filteredLedgers.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={filteredLedgers.length}
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
          data={paginatedLedgers}
          isLoading={isLoading && !filteredLedgers.length}
          loadingRows={size}
          isForbidden={isForbidden}
          forbiddenState={{
            title: "Không có quyền xem sổ cái kho hàng",
            description: "Tài khoản của bạn chưa được cấp quyền xem lịch sử biến động kho hàng (inventory-ledger:read). Vui lòng liên hệ Quản trị viên để được phân quyền.",
          }}
          emptyState={{
            title: "Nhật ký kho trống",
            description: "Chưa có bất kỳ giao dịch kho hàng nào được ghi nhận.",
            icon: <History className="h-10 w-10 text-slate-500 opacity-80" />,
            iconColor: "bg-slate-50"
          }}
        />
      </DataCard>
    </div>
  );
}
