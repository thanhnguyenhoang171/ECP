import React from 'react';
import { Badge } from '@/components/common';

/**
 * Returns a Badge component styled according to the audit log action
 * @param action The action string from the audit log
 * @returns React.ReactNode (Badge component)
 */
export const getActionBadge = (action: string): React.ReactNode => {
  const normalizedAction = action.toUpperCase();
  const purgeActions: Record<string, string> = {
    SYSTEM_PURGE_PASSWORD_APPROVAL_REQUESTED: 'Yêu cầu duyệt mật khẩu xoá',
    SYSTEM_PURGE_PASSWORD_APPROVED: 'Duyệt mật khẩu xoá',
    SYSTEM_PURGE_PASSWORD_CREATED: 'Tạo mật khẩu xoá',
    SYSTEM_PURGE_PASSWORD_CHANGED: 'Đổi mật khẩu xoá',
    SYSTEM_PURGE_PASSWORD_SAVE_FAILED: 'Lưu mật khẩu thất bại',
    SYSTEM_PURGE_STARTED: 'Bắt đầu xoá dữ liệu',
    SYSTEM_PURGE_ALL_DATA: 'Xoá dữ liệu',
    SYSTEM_PURGE_REJECTED: 'Từ chối xoá dữ liệu',
    SYSTEM_PURGE_FAILED: 'Xoá dữ liệu thất bại',
  };
  const purgeLabel = purgeActions[normalizedAction];
  if (purgeLabel) {
    return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-medium">{purgeLabel}</Badge>;
  }
  
  if (normalizedAction.startsWith('CREATE')) {
    return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-medium">Tạo mới</Badge>;
  }
  
  if (normalizedAction.startsWith('UPDATE')) {
    return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-medium">Cập nhật</Badge>;
  }
  
  if (normalizedAction.startsWith('DELETE')) {
    return <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-medium">Xóa</Badge>;
  }
  
  if (normalizedAction.includes('LOGIN')) {
    return <Badge className="bg-cyan-50 text-cyan-600 border-cyan-100 font-medium">Đăng nhập</Badge>;
  }
   
  if (normalizedAction.includes('REGISTER')) {
    return <Badge className="bg-slate-50 text-slate-600 border-slate-100 font-medium">Đăng ký</Badge>;
  }
   if (normalizedAction.includes('LOGOUT')) {
    return <Badge className="bg-slate-50 text-slate-600 border-slate-100 font-medium">Đăng xuất</Badge>;
  }
  
  if (normalizedAction.includes('EXPORT')) {
    return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-medium">Xuất dữ liệu</Badge>;
  }

    if (normalizedAction.includes('IMPORT')) {
    return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-medium">Nhập dữ liệu</Badge>;
  }
  
  return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-medium">Khác</Badge>;
};
