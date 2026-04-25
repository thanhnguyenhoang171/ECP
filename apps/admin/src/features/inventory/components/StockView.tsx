'use client';

import React from 'react';
import { Database } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function StockView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý tồn kho"
        description="Theo dõi biến động và số lượng hàng tồn thực tế."
      />
      
      <EmptyState 
        title="Dữ liệu tồn kho trống"
        description="Hệ thống chưa ghi nhận bất kỳ dữ liệu tồn kho nào vào thời điểm này."
        icon={<Database className="h-10 w-10 text-indigo-500 opacity-80" />}
        iconColor="bg-indigo-50"
      />
    </div>
  );
}
