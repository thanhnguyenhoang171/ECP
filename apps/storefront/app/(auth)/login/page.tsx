'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { loginClient } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const getErrorMessage = (err: any): string => {
    const code = err?.code || err?.data?.code;
    if (code === 'AUTH_INVALID_CREDENTIALS') {
      return 'Tài khoản hoặc mật khẩu không đúng. Xin vui lòng thử lại!';
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
    setError('');
    setIsLoading(true);

    try {
      const response = await loginClient({ username, password });

      if (!response.success) {
        const msg = response.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setError(msg);
        toast.error(msg);
        return;
      }

      // Lưu token và thông tin user vào Zustand + Cookie
      setAuth(response.data);
      toast.success('Đăng nhập thành công!');

      // Redirect về trang chủ
      router.push('/');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Đăng nhập tài khoản
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Nhập thông tin cá nhân để truy cập vào <span className="font-semibold text-zinc-900">Cacao Thai Snack Shop</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 sm:px-8 shadow-sm rounded-xl border border-zinc-200/80">

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F5C542] focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-600 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link
                href="/forgot-password"
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#F5C542] hover:bg-[#E5B32E] text-[#1E1B18] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2 text-zinc-400 font-medium">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button className="flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Footer Register Link */}
          <div className="mt-6 text-center border-t border-zinc-100 pt-4">
            <p className="text-xs text-zinc-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
                Đăng ký tài khoản mới
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
