import PurchaseOrderDetailView from '@/features/purchase-orders/components/PurchaseOrderDetailView';

export const metadata = {
  title: 'Chi tiết Đơn mua hàng| ECP Admin',
  description: 'Chi tiết Đơn mua hàng',
};

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <PurchaseOrderDetailView poId={resolvedParams.id} />;
}
