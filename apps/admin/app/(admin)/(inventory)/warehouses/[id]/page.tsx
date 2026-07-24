'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import WarehouseForm from '@/features/warehouses/components/WarehouseForm';
import { useWarehouse } from '@/features/warehouses/hooks/use-warehouses';
import { toast } from 'sonner';
import { Warehouse } from 'lucide-react';

export default function EditWarehousePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { data: warehouse, isLoading, isError } = useWarehouse(unwrappedParams.id);

  const breadcrumbItems = [
    { label: 'Kho bãi', href: '/warehouses', icon: Warehouse },
    { label: 'Cập nhật' },
  ];

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải thông tin...</div>;

  if (isError || !warehouse) {
    toast.error('Không tìm thấy địa điểm kho bãi');
    router.push('/warehouses');
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Cập nhật thông tin kho bãi"
        description="Chỉnh sửa tên, mã định danh và địa chỉ của địa điểm kho."
        showBackButton
      />
      <div className="pb-10">
        <WarehouseForm 
          initialData={warehouse} 
        />
      </div>
    </div>
  );
}
