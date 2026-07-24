import GoodsReceiptDetailView from '@/features/inventory/components/GoodsReceiptDetailView';

export const metadata = {
  title: 'Chi tiết Phiếu nhập kho | ECP Admin',
  description: 'Xem thông tin chi tiết phiếu nhập kho thực tế',
};

export default async function GoodsReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <GoodsReceiptDetailView receiptId={resolvedParams.id} />;
}
