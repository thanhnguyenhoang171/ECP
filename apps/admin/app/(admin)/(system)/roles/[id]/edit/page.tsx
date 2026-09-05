'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import RoleForm from '@/features/roles/components/RoleForm';
import { useRole } from '@/features/roles/hooks/use-roles';

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: role, isLoading: isRoleLoading, error } = useRole(id);

  const handleSuccess = () => {
    router.push('/roles');
  };

  const handleCancel = () => {
    router.push('/roles');
  };

  const breadcrumbItems = [
    { label: 'Hệ thống' },
    { label: 'Vai trò & Phân quyền', href: '/roles' },
    { label: role ? `Sửa: ${role.name}` : 'Chỉnh sửa vai trò' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={role ? `Chỉnh sửa vai trò: ${role.name}` : 'Chỉnh sửa vai trò'}
        description={role ? `Cập nhật thông tin và ma trận quyền hạn gán cho vai trò ${role.code}.` : 'Cập nhật thông tin vai trò.'}
      />

      {error || (!isRoleLoading && !role) ? (
        <div className="space-y-6 text-center py-16 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Không tìm thấy vai trò</h2>
          <p className="text-sm text-slate-500">Vai trò này có thể đã bị xóa hoặc không tồn tại trong hệ thống.</p>
          <Button onClick={() => router.push('/roles')} variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
          </Button>
        </div>
      ) : (
        <RoleForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          roleId={id}
          initialData={role}
          isLoadingData={isRoleLoading && !role}
        />
      )}
    </div>
  );
}
