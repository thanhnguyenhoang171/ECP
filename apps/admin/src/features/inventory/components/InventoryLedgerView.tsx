'use client';

import React from 'react';
import { History } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function InventoryLedgerView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sổ nhật ký kho"
        description="Tra cứu lịch sử biến động kho hàng theo thời gian thực."
      />
      
      <EmptyState 
        title="Nhật ký kho trống"
        description="Chưa có bất kỳ giao dịch nhập/xuất kho nào được ghi lại."
        icon={<History className="h-10 w-10 text-slate-500 opacity-80" />}
        iconColor="bg-slate-50"
      />
    </div>
  );
}
