'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Warehouse, MapPin } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs, NextPagination, type ColumnDef } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { 
  SearchInput, 
  AddNewButton,
  ViewActionButton,
  EditActionButton,
  DeleteActionButton,
  DeleteConfirmDialog,
} from '@/components/common/view-control';
import WarehouseDetailDialog from './WarehouseDetailDialog';
import { useWarehouses, useDeleteWarehouse } from '../hooks/use-warehouses';
import { ClientWarehouse } from '@/lib/clientDb';

export default function WarehousesView() {
  const router = useRouter();
  const { data: warehouses = [], isLoading } = useWarehouses();
  const deleteMutation = useDeleteWarehouse();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  
  // Detail Dialog State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = useCallback((warehouse: ClientWarehouse) => {
    router.push(`/warehouses/${warehouse.id}/edit`);
  }, [router]);

  const handleCreate = useCallback(() => {
    router.push('/warehouses/create');
  }, [router]);

  const handleViewDetail = useCallback((warehouse: ClientWarehouse) => {
    setSelectedWarehouseId(warehouse.id);
    setIsDetailOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirmId) return;
    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  }, [deleteConfirmId, deleteMutation]);

  const filteredWarehouses = useMemo(() => {
    const safeList = Array.isArray(warehouses) ? warehouses : [];
    return safeList.filter(
      w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [warehouses, searchTerm]);

  const paginatedWarehouses = useMemo(() => {
    const start = (page - 1) * size;
    return filteredWarehouses.slice(start, start + size);
  }, [filteredWarehouses, page, size]);

  const totalPages = Math.ceil(filteredWarehouses.length / size) || 1;

  const columns: ColumnDef<ClientWarehouse>[] = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'Mã kho',
      className: 'w-[20%] min-w-[120px]',
      headerClassName: 'w-[20%] min-w-[120px]',
      cell: (item: ClientWarehouse) => <span className="font-mono font-bold text-xs text-primary">{item.code}</span>
    },
    {
      accessorKey: 'name',
      header: 'Tên kho bãi',
      className: 'w-[50%] min-w-[260px]',
      headerClassName: 'w-[50%] min-w-[260px]',
      cell: (item: ClientWarehouse) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.name}</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <MapPin size={10} />
            {item.address || 'Không có địa chỉ'}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      align: 'center' as const,
      className: 'w-[15%] min-w-[110px]',
      headerClassName: 'w-[15%] min-w-[110px]',
      cell: (item: ClientWarehouse) => (
        <Badge className={item.isActive ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
          {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      className: 'w-[15%] min-w-[110px]',
      headerClassName: 'w-[15%] min-w-[110px]',
      cell: (item: ClientWarehouse) => (
        <div className="flex items-center justify-end gap-1">
          <ViewActionButton onClick={() => handleViewDetail(item)} />
          <EditActionButton onClick={() => handleEdit(item)} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(item.id)} />
        </div>
      )
    }
  ], [handleEdit, handleViewDetail]);

  const breadcrumbItems = [
    { label: 'Kho bãi', icon: Warehouse },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý Kho bãi"
        description="Quản lý các địa điểm lưu kho và tình trạng hoạt động."
        actions={<AddNewButton onClick={handleCreate} label="Thêm kho mới" />}
      />

      <DataCard 
        search={<SearchInput placeholder="Tìm tên kho, mã kho..." value={searchTerm} onChange={(val) => { setSearchTerm(val); setPage(1); }} />}
        footer={
          (isLoading || filteredWarehouses.length > 0) && (
            <NextPagination
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredWarehouses.length}
              itemsPerPage={size}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable 
          columns={columns} 
          data={paginatedWarehouses} 
          isLoading={isLoading && !filteredWarehouses.length}
          loadingRows={size}
          emptyState={{
            title: "Chưa có dữ liệu kho bãi",
            description: "Thêm kho hàng đầu tiên để bắt đầu quản lý tồn kho.",
            icon: <Warehouse className="h-10 w-10 text-indigo-500 opacity-80" />,
            iconColor: "bg-indigo-50"
          }}
        />
      </DataCard>

      {/* Modal Xem chi tiết */}
      <WarehouseDetailDialog 
        warehouseId={selectedWarehouseId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Hộp thoại Xác nhận Xóa */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        description="Bạn có chắc chắn muốn xóa địa điểm kho bãi này khỏi hệ thống?"
      />
    </div>
  );
}
