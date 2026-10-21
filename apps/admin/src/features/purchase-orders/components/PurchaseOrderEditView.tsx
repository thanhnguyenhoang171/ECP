'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';

import React from 'react';
import { FileText } from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import PurchaseOrderForm from './PurchaseOrderForm';
import { usePurchaseOrder } from '../hooks/use-purchase-order-mutation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Props {
  poId: string;
}

export default function PurchaseOrderEditView({ poId }: Props) : React.JSX.Element {
  const router = useRouter();
  const { data: poResponse, isLoading, error, refetch } = usePurchaseOrder(poId);

  const initialData = React.useMemo(() => poResponse ? ({ ...poResponse,
    expectedDeliveryDate: poResponse.expectedDeliveryDate?.slice(0, 10) || '',
  }) : undefined, [poResponse]);

  if (error) { return <WarehouseRequestError error={error} retry={() => { void refetch(); }} />; }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
          { label: 'Chỉnh sửa' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Đang tải dữ liệu Đơn mua hàng (PO)...
        </div>
      </div>
    );
  }

  if (!poResponse && !isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
          { label: 'Không tìm thấy' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 space-y-4">
          <p className="text-base text-slate-700 font-bold">Không tìm thấy thông tin đơn mua hàng #{poId}</p>
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            Quay lại danh sách PO
          </Button>
        </div>
      </div>
    );
  }

  if (poResponse && poResponse.status !== 'DRAFT') {
    return <WarehouseRequestError error={new Error('Chỉ được chỉnh sửa đơn mua hàng nháp.')} />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
        { label: initialData?.code || poId, href: `/purchase-orders/${poId}` },
        { label: 'Chỉnh sửa' }
      ]} />

      <PageHeader
        title={`Chỉnh sửa Đơn mua hàng #${initialData?.code || poId}`}
        description="Cập nhật thông tin nhà cung cấp, kho bãi và danh sách sản phẩm mua hàng."
      />

      <PurchaseOrderForm initialData={initialData} />
    </div>
  );
}
