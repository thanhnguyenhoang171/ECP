'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';

import type { ClientGoodsReceipt } from '@/features/inventory/types/inventory.types';

import React, { useState, useMemo, useCallback } from 'react';
import { PackagePlus } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs, NextPagination, type ColumnDef } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

import { useGoodsReceipts, useConfirmGoodsReceipt, useUpdateGoodsReceiptStatus, useDeleteGoodsReceipt } from '../hooks/use-goods-receipt-mutation';
import { CheckCircle2, XCircle, ChevronDown } from 'lucide-react';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SearchInput, AddNewButton, ViewActionButton, DeleteActionButton, DeleteConfirmDialog } from '@/components/common/view-control';
import { isForbiddenError } from '@/constants/errorMessages';

export default function GoodsReceiptView() : React.JSX.Element {
  const router = useRouter();
  const { data: receiptsData, isLoading, error, refetch } = useGoodsReceipts();
  const isForbidden = isForbiddenError(error);
  const deleteMutation = useDeleteGoodsReceipt();
  const confirmMutation = useConfirmGoodsReceipt();
  const updateStatusMutation = useUpdateGoodsReceiptStatus();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const handleUpdateStatus = useCallback((id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const receiptsList = React.useMemo(() => receiptsData ?? [], [receiptsData]);

  const filteredReceipts = React.useMemo(() => {
    return receiptsList.filter((item: ClientGoodsReceipt) =>
      item.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.purchaseOrderCode && item.purchaseOrderCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [receiptsList, searchTerm]);

  const paginatedReceipts = React.useMemo(() => {
    const start = Math.min(page - 1, Math.max(0, Math.ceil(filteredReceipts.length / size) - 1)) * size;
    return filteredReceipts.slice(start, start + size);
  }, [filteredReceipts, page, size]);

  const totalPages = Math.ceil(filteredReceipts.length / size) || 1;

  const renderStatusDropdown = useCallback((item: ClientGoodsReceipt) => {
    const status = item.status;
    const isReceived = status === 'RECEIVED';
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
        <DropdownMenuContent align="center" className="w-40 p-1 font-sans">
          <DropdownMenuItem
            onClick={() => confirmMutation.mutate(item.id)}
            disabled={confirmMutation.isPending}
            className="text-xs gap-2 font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer"
          >
            <CheckCircle2 size={14} /> Xác nhận nhập kho
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
            disabled={updateStatusMutation.isPending}
            className="text-xs gap-2 font-medium text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <XCircle size={14} /> Hủy phiếu nhập
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [handleUpdateStatus, updateStatusMutation.isPending, confirmMutation]);

  const columns: ColumnDef<ClientGoodsReceipt>[] = useMemo(() => [
    {
      accessorKey: 'receiptCode',
      header: 'Mã nhập kho',
      cell: (item) => {
        return (
          <span
            onClick={() => router.push(`/goods-receipt/${item.id}`)}
            className="font-mono font-bold text-xs text-blue-600 hover:underline cursor-pointer"
          >
            {item.receiptCode}
          </span>
        );
      }
    },
    {
      accessorKey: 'warehouseName',
      header: 'Kho thực nhận',
      cell: (item) => <span className="text-xs font-semibold text-slate-800">{item.warehouseName}</span>
    },
    {
      accessorKey: 'purchaseOrderCode',
      header: 'Đơn mua (PO)',
      cell: (item) => <span className="text-xs font-mono text-slate-600">{item.purchaseOrderCode || '---'}</span>
    },
    {
      accessorKey: 'totalItems',
      header: 'Số SKU nhập',
      cell: (item) => <span className="text-xs font-bold text-slate-700">{item.totalItems} sản phẩm</span>
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: (item) => renderStatusDropdown(item)
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày nhập',
      cell: (item) => (
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
      header: 'Thao tác',
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <ViewActionButton
            onClick={() => router.push(`/goods-receipt/${item.id}`)}
            disabled={isLoading}
          />
          {item.status === 'DRAFT' && <DeleteActionButton
            onClick={() => setDeleteConfirmId(item.id)}
            disabled={isLoading}
          />}
        </div>
      )
    }
  ], [isLoading, renderStatusDropdown, router]);

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

      <WarehouseRequestError error={error} retry={() => { void refetch(); }} />
      <DataCard
        search={<SearchInput placeholder="Tìm mã phiếu nhập, kho..." value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />}
        footer={
          !isForbidden && (isLoading || filteredReceipts.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={filteredReceipts.length}
              itemsPerPage={size}
              onItemsPerPageChange={(value) => { setSize(value); setPage(1); }}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable
          auditTrail
          recoveryModule="goods-receipt"
          columns={columns}
          data={paginatedReceipts}
          isLoading={isLoading && !filteredReceipts.length}
          loadingRows={size}
          isForbidden={isForbidden}
          forbiddenState={{
            title: "Không có quyền xem phiếu nhập kho",
            description: "Tài khoản của bạn chưa được cấp quyền xem danh sách phiếu nhập kho (goods-receipt:read). Vui lòng liên hệ Quản trị viên để được phân quyền.",
          }}
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
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteConfirmId) { deleteMutation.mutate(deleteConfirmId, { onSuccess: () => setDeleteConfirmId(null) }); }
        }}
        description="Bạn có chắc chắn muốn hủy/xóa phiếu nhập kho này? Bản ghi được xoá mềm và chỉ Super Admin có thể khôi phục."
      />
    </div>
  );
}

