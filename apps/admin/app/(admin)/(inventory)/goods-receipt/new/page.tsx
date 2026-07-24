'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus } from 'lucide-react';
import GoodsReceiptForm from '@/features/inventory/components/GoodsReceiptForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';

export default function NewGoodsReceiptPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Phiếu nhập kho', href: '/goods-receipt', icon: PackagePlus },
    { label: 'Tạo phiếu nhập mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Tạo phiếu nhập kho mới" 
        description="Điền thông tin hàng hóa nhập kho thực tế hoặc chọn tự động theo Đơn mua hàng (PO)."
      />

      <GoodsReceiptForm 
        onSuccess={() => {
          toast.success('Tạo phiếu nhập kho thành công');
          router.push('/goods-receipt');
          router.refresh();
        }} 
      />
    </div>
  );
}

