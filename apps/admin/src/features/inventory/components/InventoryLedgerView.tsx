'use client';

import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/view-control';
import { cn } from '@/lib/utils';

import { useInventoryLedgers } from '../hooks/use-inventory';

export default function InventoryLedgerView() {
  const { data: ledgerData, isLoading } = useInventoryLedgers();

  const ledgerList = React.useMemo(() => {
    if (Array.isArray(ledgerData)) {
      return ledgerData.map((item: any, idx: number) => {
        const qtyChange = Number(item.quantityChanged ?? item.quantityChange ?? 0);
        return {
          id: item.id || `leg-${idx}`,
          skuName: item.productName || item.skuName || item.skuCode || item.sku?.productName || 'Sản phẩm',
          warehouseName: item.warehouseName || item.warehouse?.name || 'Kho Chính',
          type: item.transactionType || item.type || (qtyChange >= 0 ? 'INBOUND' : 'OUTBOUND'),
          quantityChange: qtyChange,
          balanceAfter: Number(item.quantityAfter ?? item.balanceAfter ?? 0),
          referenceCode: item.referenceId || item.referenceCode || 'REF-N/A',
          createdAt: item.createdAt || new Date().toISOString()
        };
      });
    }
    return [];
  }, [ledgerData]);
  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Thời gian',
      cell: (item: any) => (
        <span className="text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      accessorKey: 'skuName',
      header: 'Sản phẩm',
      cell: (item: any) => <span className="text-sm font-bold text-slate-700">{item.skuName}</span>
    },
    {
      accessorKey: 'type',
      header: 'Loại GD',
      align: 'center' as const,
      cell: (item: any) => {
        const isPositive = item.quantityChange > 0;
        return (
          <div className="flex items-center gap-1.5">
            {isPositive ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-rose-500" />}
            <Badge className={cn(
              "text-[10px] border-none",
              item.type === 'INBOUND' || item.type === 'PURCHASE_RECEIPT' ? "bg-emerald-100 text-emerald-700" :
              item.type === 'OUTBOUND' || item.type === 'SALES_ISSUE' ? "bg-rose-100 text-rose-700" :
              "bg-amber-100 text-amber-700"
            )}>
              {item.type === 'INBOUND' || item.type === 'PURCHASE_RECEIPT' ? 'Nhập kho' : item.type === 'OUTBOUND' || item.type === 'SALES_ISSUE' ? 'Xuất kho' : 'Điều chỉnh'}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'quantityChange',
      header: 'Thay đổi',
      align: 'right' as const,
      cell: (item: any) => (
        <span className={cn("font-bold", item.quantityChange > 0 ? "text-emerald-600" : "text-rose-600")}>
          {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
        </span>
      )
    },
    {
      accessorKey: 'balanceAfter',
      header: 'Tồn sau GD',
      align: 'right' as const,
      cell: (item: any) => <span className="font-mono text-sm text-slate-600">{item.balanceAfter}</span>
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho hàng',
      className: 'text-xs text-slate-500'
    },
    {
      accessorKey: 'referenceCode',
      header: 'Chứng từ',
      cell: (item: any) => <span className="text-[11px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{item.referenceCode}</span>
    }
  ];

  const breadcrumbItems = [
    { label: 'Sổ cái kho hàng', icon: History },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Sổ cái Kho hàng"
        description="Lịch sử chi tiết mọi biến động nhập xuất tồn kho."
      />

      <DataCard search={<SearchInput placeholder="Tìm theo sản phẩm, mã chứng từ..." value="" onChange={() => {}} />}>
        <DataTable 
          columns={columns as any} 
          data={ledgerList} 
          isLoading={isLoading}
          emptyState={{
            title: "Nhật ký kho trống",
            description: "Chưa có bất kỳ giao dịch nào được thực hiện.",
            icon: <History className="h-10 w-10 text-slate-500 opacity-80" />,
            iconColor: "bg-slate-50"
          }}
        />
      </DataCard>
    </div>
  );
}
