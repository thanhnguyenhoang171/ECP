import React from 'react';
import { Badge } from '@/components/common';

/**
 * Returns a Badge component styled according to the audit log action
 * @param action The action string from the audit log
 * @returns React.ReactNode (Badge component)
 */
export const getActionBadge = (action: string) => {
  const normalizedAction = action.toUpperCase();
  
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
    return <Badge className="bg-slate-50 text-slate-600 border-slate-100 font-medium">Đăng nhập</Badge>;
  }
  
  if (normalizedAction.includes('EXPORT')) {
    return <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-medium">Xuất dữ liệu</Badge>;
  }
  
  return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-medium">Khác</Badge>;
};
