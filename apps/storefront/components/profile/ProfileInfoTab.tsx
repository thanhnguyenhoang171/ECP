'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import { AuthUser } from '@/types/user';

interface ProfileInfoTabProps {
  user: AuthUser | null;
  isDataLoading: boolean;
}

export default function ProfileInfoTab({ user, isDataLoading }: ProfileInfoTabProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-900">Thông tin cá nhân</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] text-xs font-bold rounded-lg transition-colors shadow-sm border border-amber-500/30 cursor-pointer">
          <Edit3 className="w-3.5 h-3.5 text-[#F5C542]" /> Chỉnh sửa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Họ và Tên</label>
          {isDataLoading ? (
            <div className="w-full h-9 bg-zinc-100/90 border border-zinc-200/70 rounded-lg animate-pulse" />
          ) : (
            <input
              type="text"
              readOnly
              value={user?.fullName || user?.username || ''}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Địa chỉ Email</label>
          {isDataLoading ? (
            <div className="w-full h-9 bg-zinc-100/90 border border-zinc-200/70 rounded-lg animate-pulse" />
          ) : (
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Số điện thoại</label>
          {isDataLoading ? (
            <div className="w-full h-9 bg-zinc-100/90 border border-zinc-200/70 rounded-lg animate-pulse" />
          ) : (
            <input
              type="text"
              readOnly
              value={user?.phone || ''}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
            />
          )}
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Ngày sinh</label>
          {isDataLoading ? (
            <div className="w-full h-9 bg-zinc-100/90 border border-zinc-200/70 rounded-lg animate-pulse" />
          ) : (
            <input
              type="date"
              readOnly
              value={user?.dateOfBirth || ''}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
            />
          )}
        </div>
      </div>
    </div>
  );
}
