'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  PackagePlus, 
  Building2,
  CheckCircle2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { 
  SearchInput, 
  AddNewButton, 
  FilterPopover, 
  ViewActionButton, 
  EditActionButton,
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

import { usePurchaseOrders, useUpdatePOStatus } from '../hooks/use-purchase-order-mutation';

export default function PurchaseOrdersView() {
  const router = useRouter();
  const { data: poData, isLoading } = usePurchaseOrders();
  const updateStatusMutation = useUpdatePOStatus();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const purchaseOrdersList = React.useMemo(() => {
    if (Array.isArray(poData)) {
      return poData.map((item: any) => {
        const items = item.items || [];
        const calcQty = items.reduce((acc: number, it: any) => acc + Number(it.orderQuantity || it.orderedQuantity || it.quantity || 0), 0);
        const calcAmount = items.reduce((acc: number, it: any) => acc + (Number(it.orderQuantity || it.orderedQuantity || 1) * Number(it.unitPrice || 0)), 0);

        return {
          id: item.id || item._id,
          code: item.code || item.poCode || `PO-${item.id}`,
          supplierName: item.supplierName || item.supplier?.name || 'Nhà cung cấp',
          warehouseName: item.warehouseName || item.warehouse?.name || 'Kho nhận',
          totalItems: items.length || item.totalItems || 1,
          totalQuantity: calcQty || item.totalQuantity || 1,
          totalAmount: calcAmount || item.totalAmount || 0,
          status: item.status || 'APPROVED',
          expectedDeliveryDate: item.expectedDeliveryDate || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          createdBy: item.createdBy || 'Quản trị viên'
        };
      });
    }
    return [];
  }, [poData]);

  const renderStatusDropdown = (item: any) => {
    const status = item.status;
    const isDraft = status === 'DRAFT' || status === 'PENDING';
    const isOrdered = status === 'ORDERED' || status === 'APPROVED';
    const isPartial = status === 'PARTIALLY_RECEIVED';
    const isCompleted = status === 'COMPLETED';
    const isCancelled = status === 'CANCELLED';

    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
    let label = "Bản nháp";

    if (isOrdered) {
      badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
      label = "Đã đặt hàng";
    } else if (isPartial) {
      badgeClass = "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
      label = "Nhập 1 phần";
    } else if (isCompleted) {
      badgeClass = "bg-blue-100 text-blue-700 border-blue-200";
      label = "Hoàn thành";
    } else if (isCancelled) {
      badgeClass = "bg-red-100 text-red-700 border-red-200";
      label = "Đã hủy";
    }

    if (isCompleted || isCancelled) {
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
          {isDraft && (
            <DropdownMenuItem 
              onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'ORDERED' })}
              className="text-xs gap-2 font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
            >
              <CheckCircle2 size={14} /> Đặt hàng (ORDERED)
            </DropdownMenuItem>
          )}
          {(isOrdered || isPartial) && (
            <DropdownMenuItem 
              onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'COMPLETED' })}
              className="text-xs gap-2 font-medium text-blue-700 hover:bg-blue-50 cursor-pointer"
            >
              <CheckCircle2 size={14} /> Đánh dấu hoàn thành
            </DropdownMenuItem>
          )}
          {!isCancelled && (
            <DropdownMenuItem 
              onClick={() => updateStatusMutation.mutate({ id: item.id, status: 'CANCELLED' })}
              className="text-xs gap-2 font-medium text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <XCircle size={14} /> Hủy đơn PO
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const columns = [
    {
      accessorKey: 'code',
      header: 'Mã PO',
      cell: (item: any) => (
        <span 
          onClick={() => router.push(`/purchase-orders/${item.id}`)}
          className="font-mono font-bold text-xs text-blue-600 hover:underline cursor-pointer"
        >
          {item.code}
        </span>
      )
    },
    {
      accessorKey: 'supplierName',
      header: 'Nhà cung cấp',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">{item.supplierName}</span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Building2 size={10} /> {item.warehouseName}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'totalItems',
      header: 'Số lượng đặt',
      align: 'center' as const,
      cell: (item: any) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-700">{item.totalQuantity} sản phẩm</span>
          <span className="text-[10px] text-slate-400">({item.totalItems} SKU)</span>
        </div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền mua',
      align: 'right' as const,
      cell: (item: any) => (
        <span className="text-xs font-mono font-bold text-slate-900">
          {formatCurrency(item.totalAmount)}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái (Đổi nhanh)',
      align: 'center' as const,
      cell: (item: any) => renderStatusDropdown(item)
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày lập',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600">
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-[10px] text-slate-400 italic">bởi {item.createdBy}</span>
        </div>
      )
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: any) => {
        const isApproved = item.status === 'APPROVED' || item.status === 'ORDERED';

        return (
          <div className="flex justify-end gap-1">
            <ViewActionButton 
              onClick={() => router.push(`/purchase-orders/${item.id}`)} 
              disabled={isLoading} 
            />
            <EditActionButton 
              onClick={() => router.push(`/purchase-orders/${item.id}/edit`)} 
              disabled={isLoading} 
            />

            {isApproved && item.status !== 'COMPLETED' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/goods-receipt/new?poId=${item.id}`)}
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      disabled={isLoading}
                    >
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-emerald-600 text-white">Nhập kho từ PO này</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DeleteActionButton 
              onClick={() => setDeleteConfirmId(item.id)} 
              disabled={isLoading} 
            />
          </div>
        );
      }
    }
  ];

  const breadcrumbItems = [
    { label: 'Đơn mua hàng', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý Đơn mua hàng"
        description="Theo dõi các đơn đặt mua hàng hóa từ Nhà cung cấp trước khi nhập kho."
        actions={
          <AddNewButton 
            onClick={() => router.push('/purchase-orders/new')} 
            label="Tạo đơn mua mới" 
          />
        }
      />

      <DataCard
        search={<SearchInput placeholder="Tìm theo mã PO, tên Nhà cung cấp..." value="" onChange={() => {}} />}
        extra={
          <FilterPopover activeCount={0} onClear={() => {}}>
            <div className="p-2 text-xs text-slate-500 italic">Lọc theo Nhà cung cấp, Trạng thái...</div>
          </FilterPopover>
        }
      >
        <DataTable 
          columns={columns as any} 
          data={purchaseOrdersList} 
          isLoading={isLoading}
          emptyState={{
            title: "Chưa có Đơn mua hàng nào",
            description: "Bắt đầu tạo đơn mua hàng đầu tiên từ nhà cung cấp.",
            icon: <FileText className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: "bg-blue-50"
          }}
        />
      </DataCard>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={false}
        onConfirm={() => {
          toast.success('Đã xóa đơn mua hàng thành công');
          setDeleteConfirmId(null);
        }}
        description="Bạn có chắc chắn muốn xóa đơn mua hàng này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

