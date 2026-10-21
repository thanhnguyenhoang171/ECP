'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';

import { useRouter } from 'next/navigation';
import { use, type JSX } from 'react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import SupplierForm from '@/features/suppliers/components/SupplierForm';
import { useSupplier } from '@/features/suppliers/hooks/use-suppliers';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }): JSX.Element {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { data: supplier, isLoading, isError, error, refetch } = useSupplier(unwrappedParams.id);

  const breadcrumbItems = [
    { label: 'Nhà cung cấp', href: '/suppliers', icon: Users },
    { label: 'Cập nhật' },
  ];

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải thông tin...</div>;

  if (isError || !supplier) {
    return <WarehouseRequestError error={error || new Error('Không tìm thấy dữ liệu')} retry={() => { void refetch(); }} />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Cập nhật nhà cung cấp"
        description="Chỉnh sửa thông tin liên hệ và pháp lý của nhà cung cấp."
        showBackButton
      />
      <div className="pb-10">
        <SupplierForm
          initialData={supplier}
          onSuccess={() => {
            toast.success('Cập nhật nhà cung cấp thành công');
            router.push('/suppliers');
          }}
        />
      </div>
    </div>
  );
}
