'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import UserForm from '@/features/users/components/UserForm';

export default function CreateUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/users');
  };

  const handleCancel = () => {
    router.push('/users');
  };

  const breadcrumbItems = [
    { label: 'Quản lý người dùng', href: '/users', icon: Users },
    { label: 'Tạo tài khoản mới', icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title="Tạo tài khoản người dùng mới"
        description="Điền đầy đủ thông tin cá nhân, phân quyền vai trò và trạng thái hoạt động để cấp tài khoản mới."
      />

      <UserForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
