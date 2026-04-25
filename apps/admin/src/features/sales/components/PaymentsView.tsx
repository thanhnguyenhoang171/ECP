'use client';

import React from 'react';
import { CreditCard } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function PaymentsView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý thanh toán"
        description="Quản lý hóa đơn và lịch sử giao dịch tài chính."
      />
      
      <EmptyState 
        title="Đang tích hợp cổng thanh toán"
        description="Chúng tôi đang làm việc để sớm đưa các phương thức thanh toán tự động vào hệ thống."
        icon={<CreditCard className="h-10 w-10 text-green-500 opacity-80" />}
        iconColor="bg-green-50"
      />
    </div>
  );
}
