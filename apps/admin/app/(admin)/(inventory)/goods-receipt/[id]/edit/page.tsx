import type { JSX } from 'react';
import { GoodsReceiptEditView } from '@/features/inventory/components/GoodsReceiptEditView';

export default async function EditGoodsReceiptPage({ params }: { params: Promise<{ id: string }> }): Promise<JSX.Element> {
  const { id } = await params;
  return <GoodsReceiptEditView id={id} />;
}
