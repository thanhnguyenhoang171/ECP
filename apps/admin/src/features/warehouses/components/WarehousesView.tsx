'use client';

import React, { useState } from 'react';
import { Warehouse, MoreHorizontal, Edit2, Trash2, MapPin } from "lucide-react";
import { PageHeader, DataTable, DataCard } from '@/components/common';
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

// Mock data for UI only
const mockWarehouses = [
  { id: '1', code: 'KHO-HCM-01', name: 'Kho Chính Quận 1', address: '123 Lê Lợi, Q.1, TP.HCM', isActive: true },
  { id: '2', code: 'KHO-HCM-02', name: 'Kho Phụ Quận 7', address: '456 Nguyễn Văn Linh, Q.7, TP.HCM', isActive: true },
  { id: '3', code: 'KHO-HN-01', name: 'Kho Miền Bắc', address: 'Số 10 Duy Tân, Cầu Giấy, Hà Nội', isActive: false },
];

export default function WarehousesView() {
  const [warehouses] = useState(mockWarehouses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<typeof mockWarehouses[0] | null>(null);

  const handleEdit = (warehouse: typeof mockWarehouses[0]) => {
    setEditingWarehouse(warehouse);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingWarehouse(null);
    setIsFormOpen(true);
  };

  const columns = [
    {
      accessorKey: 'code',
      header: 'Mã kho',
      cell: (item: typeof mockWarehouses[0]) => <span className="font-mono font-bold text-xs text-primary">{item.code}</span>
    },
    {
      accessorKey: 'name',
      header: 'Tên kho bãi',
      cell: (item: typeof mockWarehouses[0]) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.name}</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <MapPin size={10} />
            {item.address}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: typeof mockWarehouses[0]) => (
        <Badge className={item.isActive ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
          {item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      )
    },
    {
      id: 'actions',
      align: 'right' as const,
      cell: (item: typeof mockWarehouses[0]) => (
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
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Xóa kho
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý Kho bãi"
        description="Quản lý các địa điểm lưu kho và tình trạng hoạt động."
        actions={<AddNewButton onClick={handleCreate} label="Thêm kho mới" />}
      />

      <DataCard search={<SearchInput placeholder="Tìm tên kho, mã kho..." value="" onChange={() => {}} />}>
        <DataTable 
          columns={columns as any} 
          data={warehouses} 
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
            }} 
            initialData={editingWarehouse || undefined} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
