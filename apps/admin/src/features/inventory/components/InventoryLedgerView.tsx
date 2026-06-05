'use client';

import React from 'react';
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PageHeader, DataTable, DataCard } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/view-control';
import { cn } from '@/lib/utils';

// Mock data for Ledger
const mockLedger = [
  {
    id: '1',
    skuName: 'iPhone 15 Pro Max - Titan',
    warehouseName: 'Kho Chính Quận 1',
    type: 'INBOUND',
    quantityChange: 50,
    balanceAfter: 150,
    referenceCode: 'GR-20260601-001',
    createdAt: '2026-06-01T10:30:00Z'
  },
  {
    id: '2',
    skuName: 'Samsung Galaxy S24 Ultra',
    warehouseName: 'Kho Chính Quận 1',
    type: 'OUTBOUND',
    quantityChange: -10,
    balanceAfter: 90,
    referenceCode: 'ORD-20260531-12',
    createdAt: '2026-05-31T15:20:00Z'
  },
  {
    id: '3',
    skuName: 'AirPods Pro Gen 2',
    warehouseName: 'Kho Phụ Quận 7',
    type: 'ADJUSTMENT',
    quantityChange: -2,
    balanceAfter: 48,
    referenceCode: 'ADJ-20260530-05',
    createdAt: '2026-05-30T09:00:00Z'
  }
];

export default function InventoryLedgerView() {
  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Thời gian',
      cell: (item: typeof mockLedger[0]) => (
        <span className="text-xs text-slate-500">
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      accessorKey: 'skuName',
      header: 'Sản phẩm',
      cell: (item: typeof mockLedger[0]) => <span className="text-sm font-bold text-slate-700">{item.skuName}</span>
    },
    {
      accessorKey: 'type',
      header: 'Loại GD',
      align: 'center' as const,
      cell: (item: typeof mockLedger[0]) => {
        const isPositive = item.quantityChange > 0;
        return (
          <div className="flex items-center gap-1.5">
            {isPositive ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-rose-500" />}
            <Badge className={cn(
              "text-[10px] border-none",
              item.type === 'INBOUND' ? "bg-emerald-100 text-emerald-700" :
              item.type === 'OUTBOUND' ? "bg-rose-100 text-rose-700" :
              "bg-amber-100 text-amber-700"
            )}>
              {item.type === 'INBOUND' ? 'Nhập kho' : item.type === 'OUTBOUND' ? 'Xuất kho' : 'Điều chỉnh'}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'quantityChange',
      header: 'Thay đổi',
      align: 'right' as const,
      cell: (item: typeof mockLedger[0]) => (
        <span className={cn("font-bold", item.quantityChange > 0 ? "text-emerald-600" : "text-rose-600")}>
          {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
        </span>
      )
    },
    {
      accessorKey: 'balanceAfter',
      header: 'Tồn sau GD',
      align: 'right' as const,
      cell: (item: typeof mockLedger[0]) => <span className="font-mono text-sm text-slate-600">{item.balanceAfter}</span>
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho hàng',
      className: 'text-xs text-slate-500'
    },
    {
      accessorKey: 'referenceCode',
      header: 'Chứng từ',
      cell: (item: typeof mockLedger[0]) => <span className="text-[11px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{item.referenceCode}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sổ cái Kho hàng"
        description="Lịch sử chi tiết mọi biến động nhập xuất tồn kho."
      />

      <DataCard search={<SearchInput placeholder="Tìm theo sản phẩm, mã chứng từ..." value="" onChange={() => {}} />}>
        <DataTable 
          columns={columns as any} 
          data={mockLedger} 
          isLoading={false}
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
