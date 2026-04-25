'use client';

import React from 'react';
import { ScanBarcode } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function BarcodeScansView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quét mã vạch"
        description="Nhập/Xuất hàng nhanh chóng bằng cách quét mã vạch hoặc mã QR."
      />
      
      <EmptyState 
        title="Đang khởi tạo máy quét"
        description="Vui lòng cấp quyền truy cập camera để bắt đầu sử dụng tính năng này."
        icon={<ScanBarcode className="h-10 w-10 text-blue-500 opacity-80" />}
        iconColor="bg-blue-50"
      />
    </div>
  );
}
