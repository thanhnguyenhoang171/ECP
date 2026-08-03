'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { loginGoogleClient } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Parse token from query params or URL hash
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

        const res = await loginGoogleClient(idToken);

        if (res.success && res.data) {
          setAuth(res.data);
          router.replace('/');
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
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200/80 text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-[#F5C542] animate-spin" />
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-500 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Xác thực thành công!
            </h2>
            <p className="text-xs text-slate-500">
              Đang tự động chuyển hướng về trang chủ...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-500 shadow-inner">
              <AlertCircle className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Đăng nhập thất bại
            </h2>
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 max-w-xs">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center py-2 px-5 bg-[#F5C542] hover:bg-[#E5B32E] text-slate-900 font-bold rounded-lg text-xs transition-colors shadow-sm"
              >
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
