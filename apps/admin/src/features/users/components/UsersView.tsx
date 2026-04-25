'use client';

import React from 'react';
import { UserCircle } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function UsersView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý nhân viên"
        description="Cấp quyền và quản lý tài khoản người dùng trong hệ thống."
      />
      
      <EmptyState 
        title="Đang tải danh sách nhân viên"
        description="Dữ liệu nhân sự đang được truy xuất từ cơ sở dữ liệu."
        icon={<UserCircle className="h-10 w-10 text-slate-500 opacity-80" />}
        iconColor="bg-slate-50"
      />
    </div>
  );
}
