'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Edit2, ArrowLeft } from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/constants/errorMessages';
import UserForm from '@/features/users/components/UserForm';
import { useUser } from '@/features/users/hooks/use-users';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps): React.JSX.Element {
  const router = useRouter();
  const { id } = use(params);

  const { data: user, isLoading: isUserLoading, error, refetch } = useUser(id);

  const handleSuccess = () => {
    router.push('/users');
  };

  const handleCancel = () => {
    router.push('/users');
  };

  const breadcrumbItems = [
    { label: 'Quản lý người dùng', href: '/users', icon: Users },
    { label: user ? `Sửa: ${user.fullName}` : 'Chỉnh sửa tài khoản', icon: Edit2 },
  ];


  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={user ? `Chỉnh sửa tài khoản: ${user.fullName}` : "Chỉnh sửa tài khoản"}
        description={user ? `Cập nhật thông tin chi tiết cá nhân, vai trò và trạng thái cho ${user.email}.` : "Cập nhật thông tin tài khoản người dùng."}
      />

      {error || (!isUserLoading && !user) ? (
        <div className="space-y-6 text-center py-16 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Không thể tải tài khoản</h2>
          <p className="text-sm text-slate-500">{getApiErrorMessage(error, 'Tài khoản này có thể đã bị xoá hoặc không tồn tại.')}</p>
          <Button variant="outline" onClick={() => void refetch()}>Thử lại</Button>
          <Button onClick={() => router.push('/users')} variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
          </Button>
        </div>
      ) : (
        <UserForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          userId={id}
          initialData={user}
          isLoadingData={isUserLoading && !user}
        />
      )}
    </div>
  );
}
