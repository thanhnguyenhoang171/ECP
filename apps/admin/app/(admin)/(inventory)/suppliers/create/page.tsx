'use client';

import { useRouter } from 'next/navigation';
import { PageHeader, Breadcrumbs } from '@/components/common';
import SupplierForm from '@/features/suppliers/components/SupplierForm';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

export default function CreateSupplierPage() {
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Nhà cung cấp', href: '/suppliers', icon: Users },
    { label: 'Thêm mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader
        title="Thêm nhà cung cấp mới"
        description="Tạo nhà cung cấp mới để quản lý nguồn hàng và nhập kho."
        showBackButton
      />
      <div className="pb-10">
        <SupplierForm 
          onSuccess={() => {
            toast.success('Thêm nhà cung cấp thành công');
            router.push('/suppliers');
          }} 
        />
      </div>
    </div>
  );
}
