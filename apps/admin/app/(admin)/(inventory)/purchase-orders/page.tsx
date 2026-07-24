import PurchaseOrdersView from '@/features/purchase-orders/components/PurchaseOrdersView';

export const metadata = {
  title: 'Quản lý Đơn mua hàng | ECP Admin',
  description: 'Quản lý danh sách Đơn mua hàng từ Nhà cung cấp',
};

export default function PurchaseOrdersPage() {
  return <PurchaseOrdersView />;
}
