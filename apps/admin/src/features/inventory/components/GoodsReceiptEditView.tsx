'use client';

import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, PageHeader } from '@/components/common';
import { useGoodsReceipt } from '../hooks/use-goods-receipt-mutation';
import GoodsReceiptForm from './GoodsReceiptForm';
import { WarehouseRequestError } from './WarehouseRequestError';

export const GoodsReceiptEditView = ({ id }: { readonly id: string }): JSX.Element => {
  const router = useRouter();
  const query = useGoodsReceipt(id);
  if (query.isPending) { return <p role='status' className='p-8 text-sm text-slate-500'>Đang tải phiếu nhập...</p>; }
  if (query.error) { return <WarehouseRequestError error={query.error} retry={() => { void query.refetch(); }} />; }
  const receipt = query.data;
  if (!receipt || receipt.status !== 'DRAFT') {
    return <WarehouseRequestError error={new Error('Chỉ được chỉnh sửa phiếu nhập nháp.')} />;
  }
  return <div className='space-y-6'>
    <Breadcrumbs items={[{ label: 'Nhập kho', href: '/goods-receipt' }, { label: receipt.receiptCode, href: `/goods-receipt/${id}` }, { label: 'Chỉnh sửa' }]} />
    <PageHeader title={`Chỉnh sửa ${receipt.receiptCode}`} description='Lưu phiếu nháp trước khi xác nhận nhập kho.' showBackButton />
    <GoodsReceiptForm key={receipt.id} initialData={{ ...receipt, purchaseOrderId: receipt.purchaseOrderId || '',
      items: receipt.items.map((item) => ({ ...item, manufactureDate: item.manufactureDate?.slice(0, 10) || '', expiryDate: item.expiryDate?.slice(0, 10) || '' })),
    }} onSuccess={() => router.push(`/goods-receipt/${id}`)} />
  </div>;
};
