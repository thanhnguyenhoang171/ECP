'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Phone, Mail, Building2 } from "lucide-react";
import { PageHeader, DataTable, DataCard, Breadcrumbs } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { 
  SearchInput, 
  AddNewButton, 
  ViewActionButton, 
  EditActionButton, 
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { ClientSupplier } from '@/lib/clientDb';
import { useSuppliers, useDeleteSupplier } from '../hooks/use-suppliers';
import SupplierDetailDialog from './SupplierDetailDialog';

export default function SuppliersView() {
  const router = useRouter();
  const { data: suppliers = [], isLoading } = useSuppliers();
  const deleteMutation = useDeleteSupplier();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleViewDetail = (item: ClientSupplier) => {
    setSelectedSupplierId(item.id);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: ClientSupplier) => {
    router.push(`/suppliers/${item.id}`);
  };

  const handleCreate = () => {
    router.push('/suppliers/create');
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
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: ClientSupplier) => (
        <div className="flex justify-end gap-1">
          <ViewActionButton onClick={() => handleViewDetail(item)} disabled={isLoading} />
          <EditActionButton onClick={() => handleEdit(item)} disabled={isLoading} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(item.id)} disabled={isLoading} />
        </div>
      )
    }
  ];

  const breadcrumbItems = [
    { label: 'Nhà cung cấp', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Nhà cung cấp"
        description="Quản lý thông tin đối tác và các nhà cung cấp hàng hóa."
        actions={<AddNewButton onClick={handleCreate} label="Thêm NCC mới" />}
      />

      <DataCard search={<SearchInput placeholder="Tìm tên NCC, SĐT..." value={searchTerm} onChange={setSearchTerm} />}>
        <DataTable 
          columns={columns as any} 
          data={filteredSuppliers} 
          isLoading={isLoading}
          emptyState={{
            title: "Chưa có nhà cung cấp",
            description: "Thêm thông tin đối tác đầu tiên để thực hiện nhập kho.",
            icon: <Users className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: "bg-blue-50"
          }}
        />
      </DataCard>

      <SupplierDetailDialog 
        supplierId={selectedSupplierId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEdit}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteMutation.mutate(deleteConfirmId, {
              onSuccess: () => setDeleteConfirmId(null),
            });
          }
        }}
        description="Bạn có chắc chắn muốn xóa nhà cung cấp này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
