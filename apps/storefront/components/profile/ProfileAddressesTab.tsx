'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { AuthUser } from '@/types/user';

interface ProfileAddressesTabProps {
  user: AuthUser | null;
  isDataLoading: boolean;
}

export default function ProfileAddressesTab({ user, isDataLoading }: ProfileAddressesTabProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-900">Sổ địa chỉ nhận hàng</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
        </button>
      </div>

      <div className="space-y-3">
        {isDataLoading ? (
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2 animate-pulse">
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-3.5 w-24 bg-zinc-200/80 rounded" />
            <div className="h-3.5 w-64 bg-zinc-200/80 rounded" />
          </div>
        ) : (
          (user?.addresses || []).map((addr) => (
            <div key={addr.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900 text-xs">{addr.recipientName}</span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-medium rounded">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">SĐT: {addr.phone}</p>
              <p className="text-xs text-zinc-700 font-normal">
                {addr.street}, {addr.ward}, {addr.district}, {addr.city}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
