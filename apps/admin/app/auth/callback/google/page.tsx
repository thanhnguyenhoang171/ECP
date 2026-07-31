'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function GoogleCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        let idToken = searchParams.get('id_token') || searchParams.get('credential');

        if (!idToken && typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          idToken = hashParams.get('id_token') || hashParams.get('credential');
        }

        if (!idToken) {
          setStatus('error');
          setErrorMessage('Không tìm thấy thông tin xác thực từ Google.');
          toast.error('Đăng nhập Google thất bại: Thiếu token xác thực.');
          return;
        }

        const res = await authApi.googleLogin(idToken);

        if (res.success && res.data) {
          const { id, email, roles, accessToken } = res.data;

          const isRestricted = roles.includes('ROLE_USER') && 
                             !roles.includes('ROLE_SUPER_ADMIN') && 
                             !roles.includes('ROLE_MANAGER');

          if (isRestricted) {
            setStatus('error');
            setErrorMessage('Tài khoản Google của bạn không có quyền truy cập hệ thống quản trị.');
            toast.error('Tài khoản Google của bạn không có quyền truy cập hệ thống quản trị.');
            return;
          }

          setAuth(accessToken, { id, email, roles });
          setStatus('success');
          toast.success('Đăng nhập Quản trị bằng Google thành công!');
          setTimeout(() => {
            router.refresh();
            router.push('/dashboard');
          }, 800);
        } else {
          setStatus('error');
          const msg = res.message || 'Đăng nhập Google thất bại.';
          setErrorMessage(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        setStatus('error');
        const msg = err?.message || 'Có lỗi xảy ra trong quá trình xác thực với Google.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    };

    handleGoogleAuth();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 shadow-inner">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Đang xác thực hệ thống Admin với Google...
            </h2>
            <p className="text-xs text-slate-500 max-w-xs">
              Vui lòng chờ trong giây lát, hệ thống đang xử lý phân quyền và kiểm tra tư cách quản trị.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-500 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Xác thực Quản trị thành công!
            </h2>
            <p className="text-xs text-slate-500">
              Đang chuyển hướng vào Dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-500 shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Đăng nhập Quản trị thất bại
            </h2>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 max-w-xs">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
              >
                Quay lại trang Đăng nhập Admin
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminGoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 shadow-inner">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Đang tải...
              </h2>
            </div>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
