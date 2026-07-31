'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Edit2, ArrowLeft } from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserForm from '@/features/users/components/UserForm';
import { useUser } from '@/features/users/hooks/use-users';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: user, isLoading: isUserLoading, error } = useUser(id);

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

  const isLoading = isUserLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={user ? `Chỉnh sửa tài khoản: ${user.fullName}` : "Chỉnh sửa tài khoản"}
        description={user ? `Cập nhật thông tin chi tiết cá nhân, vai trò và trạng thái cho ${user.email}.` : "Cập nhật thông tin tài khoản người dùng."}
      />

      {isLoading ? (
        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-1/2" />
        </div>
      ) : error || !user ? (
        <div className="space-y-6 text-center py-16 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Không tìm thấy người dùng</h2>
          <p className="text-sm text-slate-500">Tài khoản này có thể đã bị xóa hoặc không tồn tại trong hệ thống.</p>
          <Button onClick={() => router.push('/users')} variant="outline">
            <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
          </Button>
        </div>
      ) : (
        <UserForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          userId={user.id}
          initialData={{
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            password: '',
            avatarUrl: user.avatarUrl || '',
          }}
        />
      )}
    </div>
  );
}
