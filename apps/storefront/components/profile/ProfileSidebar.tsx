'use client';

import React from 'react';
import { User, ShoppingBag, MapPin, Lock, LogOut } from 'lucide-react';

export type ProfileTabType = 'profile' | 'orders' | 'addresses' | 'security';

interface ProfileSidebarProps {
  activeTab: ProfileTabType;
  setActiveTab: (tab: ProfileTabType) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({ activeTab, setActiveTab, onLogout }: ProfileSidebarProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-2 space-y-1">
      <button
        onClick={() => setActiveTab('profile')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'profile'
            ? 'bg-[#1e1b18] text-[#F5C542] font-bold shadow-sm border border-amber-500/30'
            : 'text-zinc-700 hover:bg-zinc-100'
        }`}
      >
        <User className="w-4 h-4" /> Thông tin cá nhân
      </button>

      <button
        onClick={() => setActiveTab('orders')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'orders'
            ? 'bg-[#1e1b18] text-[#F5C542] font-bold shadow-sm border border-amber-500/30'
            : 'text-zinc-700 hover:bg-zinc-100'
        }`}
      >
        <ShoppingBag className="w-4 h-4" /> Đơn hàng của tôi
      </button>

      <button
        onClick={() => setActiveTab('addresses')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'addresses'
            ? 'bg-[#1e1b18] text-[#F5C542] font-bold shadow-sm border border-amber-500/30'
            : 'text-zinc-700 hover:bg-zinc-100'
        }`}
      >
        <MapPin className="w-4 h-4" /> Sổ địa chỉ nhận hàng
      </button>

      <button
        onClick={() => setActiveTab('security')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeTab === 'security'
            ? 'bg-[#1e1b18] text-[#F5C542] font-bold shadow-sm border border-amber-500/30'
            : 'text-zinc-700 hover:bg-zinc-100'
        }`}
      >
        <Lock className="w-4 h-4" /> Đổi mật khẩu & Bảo mật
      </button>

      <div className="my-1 border-t border-zinc-100"></div>

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Đăng xuất
      </button>
    </div>
  );
}
