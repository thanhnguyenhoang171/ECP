'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Breadcrumbs } from '@/components/common';
import RoleForm from '@/features/roles/components/RoleForm';

export default function CreateRolePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/roles');
  };

  const handleCancel = () => {
    router.push('/roles');
  };

  const breadcrumbItems = [
    { label: 'Hệ thống' },
    { label: 'Vai trò & Phân quyền', href: '/roles' },
    { label: 'Tạo vai trò mới' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Tạo vai trò mới"
        description="Khai báo mã vai trò, tên hiển thị và cấu hình ma trận phân quyền chi tiết cho vai trò mới trong hệ thống."
      />

      <RoleForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
