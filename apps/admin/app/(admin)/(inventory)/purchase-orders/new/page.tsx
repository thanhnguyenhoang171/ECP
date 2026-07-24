'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import PurchaseOrderForm from '@/features/purchase-orders/components/PurchaseOrderForm';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { toast } from 'sonner';

export default function NewPurchaseOrderPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Đơn mua hàng', href: '/purchase-orders', icon: ShoppingCart },
    { label: 'Tạo đơn mua hàng mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader 
        title="Tạo đơn mua hàng mới" 
        description="Lập yêu cầu đặt hàng mua linh kiện / sản phẩm từ Nhà cung cấp."
      />

      <PurchaseOrderForm 
        onSuccess={() => {
          toast.success('Tạo đơn mua hàng mới thành công');
          router.push('/purchase-orders');
          router.refresh();
        }} 
      />
    </div>
  );
}

