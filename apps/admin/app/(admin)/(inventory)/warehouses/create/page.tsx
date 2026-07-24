'use client';

import { PageHeader, Breadcrumbs } from '@/components/common';
import WarehouseForm from '@/features/warehouses/components/WarehouseForm';
import { Warehouse } from 'lucide-react';

export default function CreateWarehousePage() {
  const breadcrumbItems = [
    { label: 'Kho bãi', href: '/warehouses', icon: Warehouse },
    { label: 'Thêm mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Thêm kho bãi mới"
        description="Tạo địa điểm kho mới để quản lý thông tin nhập/xuất tồn kho."
        showBackButton
      />
      <div className="pb-10">
        <WarehouseForm />
      </div>
    </div>
  );
}
