'use client';

import React, { useState } from 'react';
import { Users, MoreHorizontal, Edit2, Trash2, Phone, Mail, Building2 } from "lucide-react";
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
import SupplierForm from './SupplierForm';
import { toast } from 'sonner';

// Mock data for UI only
const mockSuppliers = [
  { 
    id: '1', 
    name: 'Công ty TNHH Apple Việt Nam', 
    contactName: 'Nguyễn Văn A', 
    phone: '0901234567', 
    email: 'contact@apple.vn',
    address: 'Q1, TP.HCM',
    isActive: true 
  },
  { 
    id: '2', 
    name: 'Samsung Electronics HCMC', 
    contactName: 'Trần Thị B', 
    phone: '0907654321', 
    email: 'b.tran@samsung.com',
    address: 'Khu công nghệ cao, Q9, TP.HCM',
    isActive: true 
  },
  { 
    id: '3', 
    name: 'Nhà phân phối Digiworld', 
    contactName: 'Lê Văn C', 
    phone: '02812345678', 
    email: 'info@digiworld.com.vn',
    address: 'Quận 3, TP.HCM',
    isActive: false 
  },
];

export default function SuppliersView() {
  const [suppliers] = useState(mockSuppliers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<typeof mockSuppliers[0] | null>(null);

  const handleEdit = (supplier: typeof mockSuppliers[0]) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nhà cung cấp',
      cell: (item: typeof mockSuppliers[0]) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.name}</span>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1"><Building2 size={10} /> {item.address}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'contact',
      header: 'Liên hệ',
      cell: (item: typeof mockSuppliers[0]) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-slate-600">{item.contactName}</span>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Phone size={10} /> {item.phone}</span>
            <span className="flex items-center gap-1"><Mail size={10} /> {item.email}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: typeof mockSuppliers[0]) => (
        <Badge className={item.isActive ? "bg-blue-100 text-blue-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
          {item.isActive ? 'Đang hợp tác' : 'Tạm ngưng'}
        </Badge>
      )
    },
    {
      id: 'actions',
      align: 'right' as const,
      cell: (item: typeof mockSuppliers[0]) => (
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
              <Trash2 className="mr-2 h-4 w-4" /> Xóa NCC
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Nhà cung cấp"
        description="Quản lý thông tin đối tác và các nhà cung cấp hàng hóa."
        actions={<AddNewButton onClick={handleCreate} label="Thêm NCC mới" />}
      />

      <DataCard search={<SearchInput placeholder="Tìm tên NCC, SĐT..." value="" onChange={() => {}} />}>
        <DataTable 
          columns={columns as any} 
          data={suppliers} 
          isLoading={false}
          emptyState={{
            title: "Chưa có nhà cung cấp",
            description: "Thêm thông tin đối tác đầu tiên để thực hiện nhập kho.",
            icon: <Users className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: "bg-blue-50"
          }}
        />
      </DataCard>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin liên hệ và pháp lý của nhà cung cấp.</DialogDescription>
          </DialogHeader>
          <SupplierForm 
            onSuccess={() => {
              setIsFormOpen(false);
              toast.success(editingSupplier ? 'Cập nhật thành công' : 'Tạo mới thành công');
            }} 
            initialData={editingSupplier || undefined} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
