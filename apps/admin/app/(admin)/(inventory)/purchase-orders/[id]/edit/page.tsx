import PurchaseOrderEditView from '@/features/purchase-orders/components/PurchaseOrderEditView';

export const metadata = {
  title: 'Chỉnh sửa Đơn mua hàng | ECP Admin',
  description: 'Cập nhật thông tin đơn mua hàng từ Nhà cung cấp',
};

export default async function PurchaseOrderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <PurchaseOrderEditView poId={resolvedParams.id} />;
}
