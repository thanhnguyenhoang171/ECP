'use client';

import React from 'react';
import { Warehouse } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function WarehousesView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý kho hàng"
        description="Quản lý danh sách các điểm lưu kho và trung tâm phân phối."
      />
      
      <EmptyState 
        title="Đang cập nhật sơ đồ kho"
        description="Tính năng quản lý sơ đồ kho hàng chi tiết đang được phát triển."
        icon={<Warehouse className="h-10 w-10 text-amber-500 opacity-80" />}
        iconColor="bg-amber-50"
      />
    </div>
  );
}
