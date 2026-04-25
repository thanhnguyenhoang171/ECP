'use client';

import React from 'react';
import { Users } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function CustomersView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý khách hàng"
        description="Thông tin chi tiết và lịch sử mua hàng của khách hàng."
      />
      
      <EmptyState 
        title="Chưa có dữ liệu khách hàng"
        description="Bắt đầu chăm sóc khách hàng bằng cách thêm thông tin vào hệ thống."
        icon={<Users className="h-10 w-10 text-blue-500 opacity-80" />}
        iconColor="bg-blue-50"
      />
    </div>
  );
}
