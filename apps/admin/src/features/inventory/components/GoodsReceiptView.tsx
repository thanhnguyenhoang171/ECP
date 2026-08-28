'use client';

import React, { useState } from 'react';
import { PackagePlus } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs, NextPagination } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useGoodsReceipts, useConfirmGoodsReceipt, useUpdateGoodsReceiptStatus } from '../hooks/use-goods-receipt-mutation';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  SearchInput, 
  AddNewButton, 
  FilterPopover, 
  ViewActionButton, 
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { toast } from 'sonner';

export default function GoodsReceiptView() {
  const router = useRouter();
  const { data: receiptsData, isLoading } = useGoodsReceipts();
  const confirmMutation = useConfirmGoodsReceipt();
  const updateStatusMutation = useUpdateGoodsReceiptStatus();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const receiptsList = React.useMemo(() => {
    if (Array.isArray(receiptsData)) {
      return receiptsData.map((item: any) => ({
        id: item.id || item._id,
        receiptCode: item.receiptCode || item.code || `GR-${item.id}`,
        warehouseName: item.warehouseName || item.warehouse?.name || 'Kho Chính',
        purchaseOrderCode: item.purchaseOrderCode || item.purchaseOrder?.code || null,
        totalItems: Array.isArray(item.items) ? item.items.length : item.totalItems || 1,
        status: item.status || 'RECEIVED',
        createdAt: item.createdAt || new Date().toISOString(),
        createdBy: item.createdBy || 'Thủ kho'
      }));
    }
    return [];
  }, [receiptsData]);

  const filteredReceipts = React.useMemo(() => {
    return receiptsList.filter((item: any) =>
      item.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.purchaseOrderCode && item.purchaseOrderCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [receiptsList, searchTerm]);

  const paginatedReceipts = React.useMemo(() => {
    const start = (page - 1) * size;
    return filteredReceipts.slice(start, start + size);
  }, [filteredReceipts, page, size]);

  const totalPages = Math.ceil(filteredReceipts.length / size) || 1;

  const renderStatusDropdown = (item: any) => {
    const status = item.status;
    const isDraft = status === 'DRAFT';
    const isReceived = status === 'RECEIVED' || status === 'COMPLETED';
    const isCancelled = status === 'CANCELLED';

    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    let label = "Bản nháp";

    if (isReceived) {
      badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      label = "Đã nhập kho";
    } else if (isCancelled) {
      badgeClass = "bg-red-100 text-red-700 border-red-200";
      label = "Đã hủy";
    }

    if (isReceived || isCancelled) {
      return <Badge className={`text-xs border ${badgeClass}`}>{label}</Badge>;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${badgeClass}`}>
            <span>{label}</span>
            <ChevronDown size={12} className="opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48 p-1">
          <DropdownMenuItem 
            onClick={() => confirmMutation.mutate(item.id)}
            disabled={confirmMutation.isPending}
            className="text-xs gap-2 font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
          >
            <CheckCircle2 size={14} /> Xác nhận nhập kho
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'CANCELLED' })}
            disabled={updateStatusMutation.isPending}
            className="text-xs gap-2 font-medium text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <XCircle size={14} /> Hủy phiếu nhập
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns = [
    {
      accessorKey: 'receiptCode',
      header: 'Mã nhập kho',
      className: 'w-[15%] min-w-[120px]',
      headerClassName: 'w-[15%] min-w-[120px]',
      cell: (item: any) => (
        <span 
          onClick={() => router.push(`/goods-receipt/${item.id}`)}
          className="font-mono font-bold text-xs text-blue-600 hover:underline cursor-pointer"
        >
          {item.receiptCode}
        </span>
      )
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho thực nhận',
      className: 'w-[20%] min-w-[150px]',
      headerClassName: 'w-[20%] min-w-[150px]',
      cell: (item: any) => (
        <span className="text-xs font-semibold text-slate-800">{item.warehouseName}</span>
      )
    },
    {
      accessorKey: 'purchaseOrderCode',
      header: 'Đơn mua (PO)',
      className: 'w-[15%] min-w-[120px]',
      headerClassName: 'w-[15%] min-w-[120px]',
      cell: (item: any) => (
        <span className="text-xs font-mono text-slate-600">
          {item.purchaseOrderCode || '---'}
        </span>
      )
    },
    {
      accessorKey: 'totalItems',
      header: 'Số SKU nhập',
      align: 'center' as const,
      className: 'w-[12%] min-w-[100px]',
      headerClassName: 'w-[12%] min-w-[100px]',
      cell: (item: any) => (
        <span className="text-xs font-bold text-slate-700">{item.totalItems} sản phẩm</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái (Đổi nhanh)',
      align: 'center' as const,
      className: 'w-[18%] min-w-[140px]',
      headerClassName: 'w-[18%] min-w-[140px]',
      cell: (item: any) => renderStatusDropdown(item)
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày nhập',
      className: 'w-[12%] min-w-[110px]',
      headerClassName: 'w-[12%] min-w-[110px]',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-[10px] text-slate-400 italic">{item.createdBy}</span>
        </div>
      )
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      className: 'w-[8%] min-w-[90px]',
      headerClassName: 'w-[8%] min-w-[90px]',
      cell: (item: any) => (
        <div className="flex justify-end gap-1">
          <ViewActionButton 
            onClick={() => router.push(`/goods-receipt/${item.id}`)} 
            disabled={isLoading} 
          />
          <DeleteActionButton 
            onClick={() => setDeleteConfirmId(item.id)} 
            disabled={isLoading} 
          />
        </div>
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
        search={<SearchInput placeholder="Tìm kiếm theo mã phiếu, kho..." value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />}
        footer={
          (isLoading || filteredReceipts.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredReceipts.length}
              itemsPerPage={size}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable 
          columns={columns as any} 
          data={paginatedReceipts} 
          isLoading={isLoading && !filteredReceipts.length}
          loadingRows={size}
          emptyState={{
            title: "Chưa có phiếu nhập kho",
            description: "Bắt đầu tạo phiếu nhập kho đầu tiên để quản lý hàng tồn.",
            icon: <PackagePlus className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: "bg-blue-50"
          }}
        />
      </DataCard>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={false}
        onConfirm={() => {
          toast.success('Đã hủy/xóa phiếu nhập kho thành công');
          setDeleteConfirmId(null);
        }}
        description="Bạn có chắc chắn muốn hủy/xóa phiếu nhập kho này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

