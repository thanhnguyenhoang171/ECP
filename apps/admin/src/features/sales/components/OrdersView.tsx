'use client';

import React from 'react';
import { ShoppingCart } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function OrdersView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý đơn hàng"
        description="Theo dõi và xử lý các đơn hàng từ khách hàng."
      />
      
      <EmptyState 
        title="Đang khởi tạo dữ liệu"
        description="Danh sách đơn hàng đang được đồng bộ từ hệ thống. Vui lòng quay lại sau ít phút."
        icon={<ShoppingCart className="h-10 w-10 text-green-500 opacity-80" />}
        iconColor="bg-green-50"
      />
    </div>
  );
}
