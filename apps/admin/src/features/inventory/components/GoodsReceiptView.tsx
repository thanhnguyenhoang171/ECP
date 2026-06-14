'use client';

import React from 'react';
import { PackagePlus, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchInput, AddNewButton, FilterPopover } from '@/components/common/view-control';

// Mock data for UI only
const mockReceipts = [
  {
    id: '1',
    receiptCode: 'GR-20260601-001',
    warehouseName: 'Kho Chính Quận 1',
    purchaseOrderCode: 'PO-20260520-05',
    totalItems: 5,
    status: 'COMPLETED',
    createdAt: '2026-06-01T10:30:00Z',
    createdBy: 'Thanh Nguyen'
  },
  {
    id: '2',
    receiptCode: 'GR-20260528-003',
    warehouseName: 'Kho Phụ Quận 7',
    purchaseOrderCode: null,
    totalItems: 12,
    status: 'PENDING',
    createdAt: '2026-05-28T14:20:00Z',
    createdBy: 'Admin User'
  }
];

export default function GoodsReceiptView() {
  const router = useRouter();

  const columns = [
    {
      accessorKey: 'receiptCode',
      header: 'Mã nhập kho',
      cell: (item: typeof mockReceipts[0]) => (
        <span className="font-mono font-bold text-xs text-primary">{item.receiptCode}</span>
      )
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho nhập',
      className: 'text-sm font-medium text-slate-600'
    },
    {
      accessorKey: 'purchaseOrderCode',
      header: 'Đơn mua hàng',
      cell: (item: typeof mockReceipts[0]) => item.purchaseOrderCode ? (
        <Badge variant="outline" className="text-[10px] font-mono border-slate-200">
          {item.purchaseOrderCode}
        </Badge>
      ) : (
        <span className="text-slate-400 italic text-xs">N/A</span>
      )
    },
    {
      accessorKey: 'totalItems',
      header: 'Số lượng mặt hàng',
      align: 'center' as const,
      cell: (item: typeof mockReceipts[0]) => (
        <span className="text-sm font-bold text-slate-700">{item.totalItems}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: typeof mockReceipts[0]) => {
        const status = item.status;
        return (
          <Badge 
            className={cn(
              "text-[10px] border-none px-2 py-0.5 whitespace-nowrap",
              status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" : 
              status === 'PENDING' ? "bg-amber-100 text-amber-700" : 
              "bg-slate-100 text-slate-700"
            )}
          >
            {status === 'COMPLETED' ? 'Hoàn thành' : status === 'PENDING' ? 'Đang xử lý' : status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày nhập',
      cell: (item: typeof mockReceipts[0]) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-[10px] text-slate-400 italic">{item.createdBy}</span>
        </div>
      )
    },
    {
      id: 'actions',
      align: 'right' as const,
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400">Tùy chọn</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer text-sm">
              <Eye className="mr-2 h-4 w-4 opacity-70" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-sm text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4 opacity-70" /> Hủy phiếu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const breadcrumbItems = [
    { label: 'Nhập kho', icon: PackagePlus },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý Nhập kho"
        description="Theo dõi và quản lý các phiếu nhập hàng vào kho thực tế."
        actions={
          <AddNewButton 
            onClick={() => router.push('/goods-receipt/new')} 
            label="Nhập kho mới" 
          />
        }
      />

      <DataCard
        search={<SearchInput placeholder="Tìm kiếm theo mã phiếu, kho..." value="" onChange={() => {}} />}
        extra={
          <FilterPopover activeCount={0} onClear={() => {}}>
            <div className="p-2 text-xs text-slate-500 italic">Tính năng lọc đang phát triển...</div>
          </FilterPopover>
        }
      >
        <DataTable 
          columns={columns as any} 
          data={mockReceipts} 
          isLoading={false}
          emptyState={{
            title: "Chưa có phiếu nhập kho",
            description: "Bắt đầu tạo phiếu nhập kho đầu tiên để quản lý hàng tồn.",
            icon: <PackagePlus className="h-10 w-10 text-indigo-500 opacity-80" />,
            iconColor: "bg-indigo-50"
          }}
        />
      </DataCard>
    </div>
  );
}
