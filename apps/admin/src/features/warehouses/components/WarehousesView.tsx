'use client';

import React, { useState, useMemo } from 'react';
import { Warehouse, MoreHorizontal, Edit2, Trash2, MapPin } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SearchInput, AddNewButton } from '@/components/common/view-control';
import WarehouseForm from './WarehouseForm';
import { toast } from 'sonner';
import { clientDb, ClientWarehouse } from '@/lib/clientDb';

export default function WarehousesView() {
  const [warehouses, setWarehouses] = useState<ClientWarehouse[]>(() => clientDb.getWarehouses());
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<ClientWarehouse | null>(null);

  const refreshData = () => {
    setWarehouses(clientDb.getWarehouses());
  };

  const handleEdit = (warehouse: ClientWarehouse) => {
    setEditingWarehouse(warehouse);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingWarehouse(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (clientDb.deleteWarehouse(id)) {
      toast.success('Xóa kho bãi thành công');
      refreshData();
    } else {
      toast.error('Không thể xóa kho bãi');
    }
  };

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(
      w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [warehouses, searchTerm]);

  const columns = [
    {
      accessorKey: 'code',
      header: 'Mã kho',
      cell: (item: ClientWarehouse) => <span className="font-mono font-bold text-xs text-primary">{item.code}</span>
    },
    {
      accessorKey: 'name',
      header: 'Tên kho bãi',
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
      cell: (item: ClientWarehouse) => (
        <Badge className={item.isActive ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
          {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      )
    },
    {
      id: 'actions',
      align: 'right' as const,
      cell: (item: ClientWarehouse) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400">Tùy chọn</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Xóa kho
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

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

      <DataCard search={<SearchInput placeholder="Tìm tên kho, mã kho..." value={searchTerm} onChange={setSearchTerm} />}>
        <DataTable 
          columns={columns as any} 
          data={filteredWarehouses} 
          isLoading={false}
          emptyState={{
            title: "Chưa có dữ liệu kho bãi",
            description: "Thêm kho hàng đầu tiên để bắt đầu quản lý tồn kho.",
            icon: <Warehouse className="h-10 w-10 text-indigo-500 opacity-80" />,
            iconColor: "bg-indigo-50"
          }}
        />
      </DataCard>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Chỉnh sửa kho hàng' : 'Thêm kho hàng mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết về địa điểm kho bãi.</DialogDescription>
          </DialogHeader>
          <WarehouseForm 
            onSuccess={() => {
              setIsFormOpen(false);
              toast.success(editingWarehouse ? 'Cập nhật thành công' : 'Tạo mới thành công');
              refreshData();
            }} 
            initialData={editingWarehouse || undefined} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
