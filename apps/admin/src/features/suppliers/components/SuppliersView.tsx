'use client';

import React, { useState, useMemo } from 'react';
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
import { clientDb, ClientSupplier } from '@/lib/clientDb';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<ClientSupplier[]>(() => clientDb.getSuppliers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ClientSupplier | null>(null);

  const refreshData = () => {
    setSuppliers(clientDb.getSuppliers());
  };

  const handleEdit = (supplier: ClientSupplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (clientDb.deleteSupplier(id)) {
      toast.success('Xóa nhà cung cấp thành công');
      refreshData();
    } else {
      toast.error('Không thể xóa nhà cung cấp');
    }
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nhà cung cấp',
      cell: (item: ClientSupplier) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.name}</span>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span className="flex items-center gap-1"><Building2 size={10} /> {item.address || 'Không có địa chỉ'}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'contact',
      header: 'Liên hệ',
      cell: (item: ClientSupplier) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-slate-600">{item.contactName || 'N/A'}</span>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Phone size={10} /> {item.phone || 'N/A'}</span>
            <span className="flex items-center gap-1"><Mail size={10} /> {item.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: ClientSupplier) => (
        <Badge className={item.isActive ? "bg-blue-100 text-blue-700 border-none" : "bg-slate-100 text-slate-500 border-none"}>
          {item.isActive ? 'Đang hợp tác' : 'Tạm ngưng'}
        </Badge>
      )
    },
    {
      id: 'actions',
      align: 'right' as const,
      cell: (item: ClientSupplier) => (
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

      <DataCard search={<SearchInput placeholder="Tìm tên NCC, SĐT..." value={searchTerm} onChange={setSearchTerm} />}>
        <DataTable 
          columns={columns as any} 
          data={filteredSuppliers} 
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
              refreshData();
            }} 
            initialData={editingSupplier || undefined} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
