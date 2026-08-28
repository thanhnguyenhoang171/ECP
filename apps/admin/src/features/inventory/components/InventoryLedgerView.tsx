'use client';

import React, { useState, useMemo } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, FileText, Tag } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs, NextPagination } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/view-control';
import { cn } from '@/lib/utils';
import { useInventoryLedgers } from '../hooks/use-inventory';

export default function InventoryLedgerView() {
  const { data: ledgerData, isLoading } = useInventoryLedgers();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const ledgerList = React.useMemo(() => {
    if (Array.isArray(ledgerData)) {
      return ledgerData.map((item: any, idx: number) => {
        const qtyChange = Number(item.quantityChanged ?? item.quantityChange ?? 0);
        return {
          id: item.id || `leg-${idx}`,
          skuCode: item.skuCode || item.skuName || item.sku?.skuCode || 'SKU-UNKNOWN',
          batchCode: item.batchCode || '',
          warehouseName: item.warehouseName || item.warehouse?.name || 'Kho Chính',
          type: item.transactionType || item.type || (qtyChange >= 0 ? 'INBOUND' : 'OUTBOUND'),
          quantityChange: qtyChange,
          balanceAfter: Number(item.quantityAfter ?? item.balanceAfter ?? 0),
          referenceId: item.referenceId || item.referenceCode || 'N/A',
          referenceType: item.referenceType || 'SYS',
          note: item.note || '',
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });
    }
    return [];
  }, [ledgerData]);

  const filteredLedgers = useMemo(() => {
    return ledgerList.filter((item: any) =>
      item.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.note.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ledgerList, searchTerm]);

  const paginatedLedgers = useMemo(() => {
    const start = (page - 1) * size;
    return filteredLedgers.slice(start, start + size);
  }, [filteredLedgers, page, size]);

  const totalPages = Math.ceil(filteredLedgers.length / size) || 1;

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Thời gian',
      className: 'w-[14%] min-w-[120px]',
      headerClassName: 'w-[14%] min-w-[120px]',
      cell: (item: any) => (
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
      cell: (item: any) => (
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
      cell: (item: any) => {
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
      cell: (item: any) => (
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
      cell: (item: any) => <span className="font-mono text-xs font-extrabold text-slate-800">{item.balanceAfter}</span>,
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho hàng',
      className: 'w-[14%] min-w-[110px]',
      headerClassName: 'w-[14%] min-w-[110px]',
      cell: (item: any) => <span className="text-xs text-slate-600">{item.warehouseName}</span>,
    },
    {
      accessorKey: 'referenceId',
      header: 'Mã chứng từ',
      className: 'w-[14%] min-w-[120px]',
      headerClassName: 'w-[14%] min-w-[120px]',
      cell: (item: any) => (
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
      cell: (item: any) => <span className="text-xs text-slate-500 line-clamp-1">{item.note || '---'}</span>,
    },
  ];

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

      <DataCard 
        search={<SearchInput placeholder="Tìm theo mã SKU, mã chứng từ..." value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />}
        footer={
          (isLoading || filteredLedgers.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredLedgers.length}
              itemsPerPage={size}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable 
          columns={columns as any} 
          data={paginatedLedgers} 
          isLoading={isLoading && !filteredLedgers.length}
          loadingRows={size}
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
