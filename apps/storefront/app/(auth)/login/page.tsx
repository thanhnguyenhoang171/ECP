'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { loginClient, getAccountInfo } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Nếu đã đăng nhập → redirect về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const getErrorMessage = (err: any): string => {
    const code = err?.code || err?.data?.code;
    if (code === 'AUTH_INVALID_CREDENTIALS') {
      return 'Email hoặc mật khẩu không đúng. Xin vui lòng thử lại!';
    }
    if (code === 'USER_NOT_FOUND') {
      return 'Tài khoản không tồn tại. Xin vui lòng kiểm tra lại!';
    }
    if (code === 'ACCOUNT_LOCKED') {
      return 'Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ!';
    }
    if (err?.message && typeof err.message === 'string') {
      return err.message;
    }
    return 'Đăng nhập thất bại. Xin vui lòng thử lại!';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginClient({ email, password });

      if (!response.success) {
        const msg = response.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        toast.error(msg);
        return;
      }

      setAuth(response.data);

      try {
        const accountData = await getAccountInfo();
        setAuth({
          ...response.data,
          ...accountData,
          id: accountData.id || response.data.id,
          email: accountData.email || response.data.email,
          roles: accountData.roles || (accountData.role ? [accountData.role] : response.data.roles),
          firstName: accountData.firstName,
          lastName: accountData.lastName,
          avatarUrl: accountData.avatarUrl,
        });
      } catch (accountErr) {
        console.error('Lỗi lấy thông tin tài khoản từ API /users/account:', accountErr);
      }

      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md my-auto">
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 border border-blue-500 overflow-hidden flex items-center justify-center shadow-xs">
              <Image
                src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg"
                alt="Cacao Thai Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Nhập thông tin cá nhân để truy cập <span className="font-semibold text-slate-900">Cacao Thai Snack Shop</span>
          </p>
        </div>

        <div className="bg-white py-6 px-6 sm:px-8 shadow-xs rounded-2xl border border-slate-200/80 overflow-hidden">

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-600 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link
                href="/forgot-password"
                className="text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs border border-blue-600 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Social Login Buttons */}
          <SocialLoginButtons />

          {/* Footer Register Link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                Đăng ký tài khoản mới
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
