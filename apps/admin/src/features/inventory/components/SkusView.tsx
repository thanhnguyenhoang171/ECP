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
        title="Chưa có mã SKU"
        description="Vui lòng cấu hình sản phẩm để hệ thống tự động sinh mã SKU."
        icon={<Layers className="h-10 w-10 text-slate-500 opacity-80" />}
        iconColor="bg-slate-50"
      />
    </div>
  );
}
