'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Lock, 
  Award, 
  Edit3, 
  Package, 
  ChevronRight,
  Plus,
  Phone,
  Mail,
  LogOut
} from 'lucide-react';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { useAuthStore } from '@/store/authStore';
import { logoutClient } from '@/services/auth.service';

const mockOrders = [
  {
    id: 'ORD-2026-8891',
    date: '20/07/2026',
    status: 'Đang giao hàng',
    statusColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    total: 3240000,
    itemsCount: 2,
    productName: 'Tai Nghe Không Dây Pro Max ANC',
  },
  {
    id: 'ORD-2026-7712',
    date: '05/06/2026',
    status: 'Hoàn thành',
    statusColor: 'bg-zinc-900 text-white border-zinc-900',
    total: 1450000,
    itemsCount: 1,
    productName: 'Áo Polo Cotton Compact',
  },
];

function ProfileContent() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'security'>('profile');
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutClient();
    clearAuth();
    router.push('/');
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FFF8E1] to-[#FEF3C7] rounded-2xl p-6 sm:p-8 text-zinc-900 border border-amber-200/90 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-[#F5C542] border border-amber-300 flex items-center justify-center text-[#1E1B18] font-bold text-xl shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-bold text-zinc-900">{user.username}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300/80 text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-800" />
                    {user.roles?.[0]?.replace('ROLE_', '') ?? 'Member'}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 mt-1 flex items-center justify-center sm:justify-start gap-3 font-medium">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-amber-800" /> {user.email}</span>
                </p>
              </div>
            </div>

            <div className="bg-amber-100/80 px-5 py-3 rounded-xl border border-amber-200/90 flex items-center gap-3 shadow-xs">
              <Award className="w-6 h-6 text-amber-800" />
              <div>
                <p className="text-[11px] font-medium text-amber-900/80">Vai trò</p>
                <p className="text-base font-bold text-zinc-900">{user.roles?.[0]?.replace('ROLE_', '') ?? 'User'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Layout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-zinc-200/80 p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#F5C542] text-zinc-900 font-bold shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <User className="w-4 h-4" /> Thông tin cá nhân
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#F5C542] text-zinc-900 font-bold shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Đơn hàng của tôi
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-[#F5C542] text-zinc-900 font-bold shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <MapPin className="w-4 h-4" /> Sổ địa chỉ nhận hàng
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-[#F5C542] text-zinc-900 font-bold shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Lock className="w-4 h-4" /> Đổi mật khẩu & Bảo mật
              </button>

              <div className="my-1 border-t border-zinc-100"></div>

              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </div>

          {/* Panels */}
          <div className="lg:col-span-3">
            
            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900">Thông tin cá nhân</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5C542] text-zinc-900 text-xs font-bold rounded-lg hover:bg-[#E5B32E] transition-colors shadow-sm">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      readOnly
                      value={user.fullName || user.username}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Địa chỉ Email</label>
                    <input
                      type="email"
                      readOnly
                      value={user.email}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      readOnly
                      value={user.phone || ''}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      readOnly
                      value={user.dateOfBirth || ''}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
                  Lịch sử đơn hàng
                </h3>

                <div className="space-y-3">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-zinc-600" />
                          <span className="font-semibold text-zinc-900 text-xs">{order.id}</span>
                          <span className="text-[11px] text-zinc-400">• {order.date}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${order.statusColor} self-start sm:self-auto`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-600">
                        <p className="font-medium text-zinc-800">{order.productName}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{order.itemsCount} sản phẩm</p>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-900">
                          Tổng tiền: <span className="font-bold">{formatVND(order.total)}</span>
                        </span>
                        <button className="flex items-center gap-1 text-zinc-900 font-medium hover:underline text-xs">
                          Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900">Sổ địa chỉ nhận hàng</h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Thêm địa chỉ mới
                  </button>
                </div>

                <div className="space-y-3">
                  {(user.addresses || []).map((addr) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Security */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
                  Thay đổi mật khẩu
                </h3>

                <form className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 text-white font-medium text-xs rounded-lg hover:bg-zinc-800 transition-colors mt-2"
                  >
                    Cập nhật mật khẩu
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileContent />
    </ProtectedPage>
  );
}
