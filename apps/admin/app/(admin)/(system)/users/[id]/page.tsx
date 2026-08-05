'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/features/users/hooks/use-users';
import { ROLE_OPTIONS } from '@/features/users/types/user.interface';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: user, isLoading, error } = useUser(id);

  const roleMeta = user ? ROLE_OPTIONS.find((r) => r.value === user.role) : null;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const breadcrumbItems = [
    { label: 'Quản lý người dùng', href: '/users' },
    { label: user ? user.fullName : 'Chi tiết tài khoản' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={user ? `Chi tiết tài khoản: ${user.fullName}` : "Chi tiết tài khoản"}
        description="Xem toàn bộ thông tin chi tiết cá nhân, vai trò quản trị và trạng thái hoạt động."
        actions={
          user && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/users')}>
                Quay lại
              </Button>
              <Button onClick={() => router.push(`/users/${user.id}/edit`)}>
                Chỉnh sửa tài khoản
              </Button>
            </div>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-6 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error || !user ? (
        <div className="space-y-6 text-center py-16 bg-white rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Không tìm thấy người dùng</h2>
          <p className="text-sm text-slate-500">Tài khoản này có thể đã bị xóa hoặc không tồn tại trong hệ thống.</p>
          <Button onClick={() => router.push('/users')} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 text-center">
            <Avatar className="h-24 w-24 mx-auto border-2 border-primary/20 shadow-md">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user.fullName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Badge variant="outline" className={`text-xs font-bold py-1 px-3 border-none ${roleMeta?.color || 'bg-slate-100 text-slate-600'}`}>
                {roleMeta?.label || user.role}
              </Badge>
              <Badge className={`text-xs font-bold py-1 px-3 border-none uppercase ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {user.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
              </Badge>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Thông tin chi tiết</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Họ và tên</span>
                  <span className="font-semibold text-slate-800">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Địa chỉ Email</span>
                  <span className="font-mono text-slate-800">{user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Số điện thoại</span>
                  <span className="font-mono text-slate-800">{user.phone || 'Chưa cập nhật'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">ID Người dùng</span>
                  <span className="font-mono text-slate-800">{user.id}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Ngày đăng ký</span>
                  <span className="text-slate-800">{user.createdAt || 'Chưa rõ'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Vai trò hệ thống</span>
                  <span className="font-semibold text-slate-800">{roleMeta?.label || user.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
