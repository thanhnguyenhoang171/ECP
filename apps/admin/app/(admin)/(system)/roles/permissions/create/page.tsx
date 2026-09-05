'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Breadcrumbs } from '@/components/common';
import PermissionForm from '@/features/roles/components/PermissionForm';

export default function CreatePermissionPage(): React.JSX.Element {
  const router = useRouter();

  const handleSuccess = (): void => {
    router.push('/roles');
  };

  const handleCancel = (): void => {
    router.push('/roles');
  };

  const breadcrumbItems = [
    { label: 'Hệ thống' },
    { label: 'Vai trò & Phân quyền', href: '/roles' },
    { label: 'Thêm quyền hạn mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Thêm quyền hạn mới"
        description="Khai báo mã đặc quyền mới và nhóm module quản trị tương ứng vào danh mục kiểm soát truy cập hệ thống."
      />

      <PermissionForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
