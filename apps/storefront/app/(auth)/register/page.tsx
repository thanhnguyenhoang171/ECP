'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { registerClient } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Nếu đã đăng nhập → redirect về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerClient({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (!response.success) {
        setError(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        return;
      }

      // Đăng ký thành công → tự động đăng nhập (API trả về token)
      setAuth(response.data);

      // Redirect về trang chủ
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5C542] overflow-hidden flex items-center justify-center shadow-sm">
            <Image
              src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg"
              alt="Cacao Thai Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
          Tạo tài khoản thành viên
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Nhập thông tin cá nhân để hoàn tất đăng ký tài khoản <span className="font-semibold text-zinc-900">Cacao Thai Snack Shop</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-sm rounded-xl border border-zinc-200/80">

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912 345 678"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-9 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start pt-1">
              <input
                id="agree-terms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="h-3.5 w-3.5 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded mt-0.5"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-zinc-600 leading-normal">
                Tôi chấp nhận <span className="font-semibold text-zinc-900 hover:underline cursor-pointer">Điều khoản sử dụng</span> và <span className="font-semibold text-zinc-900 hover:underline cursor-pointer">Chính sách bảo mật</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#1e1b18] hover:bg-zinc-800 text-[#F5C542] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 mt-3 shadow-sm border border-amber-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  Tạo tài khoản ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Buttons */}
          <SocialLoginButtons />

          {/* Footer Login Link */}
          <div className="mt-5 text-center border-t border-zinc-100 pt-4">
            <p className="text-xs text-zinc-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
