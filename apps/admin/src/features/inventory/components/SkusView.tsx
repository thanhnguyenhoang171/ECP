'use client';

import React from 'react';
import { Layers } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function SkusView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý SKUs"
        description="Định danh và quản lý các đơn vị hàng hóa chi tiết."
      />
      
      <EmptyState 
        icon={<Layers className="w-10 h-10 text-amber-500" />}
        title="Chưa có mã SKU"
        description="Vui lòng cấu hình sản phẩm để hệ thống tự động sinh mã SKU."
      />
    </div>
  );
}
