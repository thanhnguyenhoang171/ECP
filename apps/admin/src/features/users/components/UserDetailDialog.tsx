'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DetailDialog, DetailSection } from '@/components/common';
import { User, ROLE_OPTIONS } from '../types/user.interface';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Shield, 
  Activity, 
  Calendar, 
  Hash, 
  Wifi, 
  WifiOff, 
  Clock 
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface UserDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserDetailDialog({
  isOpen,
  onOpenChange,
  user,
}: UserDetailDialogProps) {
  if (!user) return null;

  const roleMeta = ROLE_OPTIONS.find((r) => r.value === user.role);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const sections: DetailSection[] = [
    {
      title: "Thông tin cá nhân & Tài khoản",
      cols: 2,
      items: [
        {
          label: "Ảnh đại diện",
          value: (
            <div className="flex items-center gap-3 mt-1">
              <Avatar className="h-12 w-12 border border-slate-200 shadow-sm">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
                <span className="text-xs text-slate-400 font-mono">{user.email}</span>
              </div>
            </div>
          ),
          colSpan: 2,
        },
        { label: "Họ và tên", value: user.fullName, icon: UserIcon },
        { label: "Địa chỉ Email", value: user.email, icon: Mail, fontMono: true },
        { label: "Số điện thoại", value: user.phone || 'Chưa cập nhật', icon: Phone },
        { label: "ID Tài khoản", value: user.id, icon: Hash, fontMono: true },
      ]
    },
    {
      title: "Quyền hạn & Trạng thái",
      cols: 2,
      items: [
        {
          label: "Vai trò quản trị",
          value: (
            <Badge variant="outline" className={`text-xs font-bold py-0.5 px-2.5 border-none mt-0.5 ${roleMeta?.color || 'bg-slate-100 text-slate-600'}`}>
              {roleMeta?.label || user.role}
            </Badge>
          ),
          icon: Shield,
        },
        {
          label: "Trạng thái tài khoản",
          value: (
            <Badge 
              className={`text-xs font-bold py-0.5 px-2.5 border-none uppercase mt-0.5 ${
                user.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {user.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
            </Badge>
          ),
          icon: Activity,
        },
        {
          label: "Trạng thái phiên làm việc",
          value: (
            <div className="flex items-center gap-2 mt-1">
              {user.isOnline ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Wifi size={14} />
                  <span>Trực tuyến</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  <WifiOff size={14} />
                  <span>Ngoại tuyến</span>
                </div>
              )}
            </div>
          ),
        },
        { 
          label: "Hoạt động gần nhất", 
          value: user.lastActive || 'Không rõ', 
          icon: Clock 
        },
      ]
    },
  ];

  return (
    <DetailDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      createdAt={user.createdAt}
      updatedAt={user.updatedAt}
      sections={sections}
    />
  );
}

export default UserDetailDialog;
