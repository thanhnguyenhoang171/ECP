'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginGoogleClient, getAccountInfo } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function SocialLoginButtons() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Load Google Identity Services script
    const scriptId = 'google-gsi-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCredential = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginGoogleClient(credentialResponse.credential);
      if (res.success && res.data) {
        setAuth(res.data);
        try {
          const accountData = await getAccountInfo();
          setAuth({
            ...res.data,
            ...accountData,
            id: accountData.id || res.data.id,
            email: accountData.email || res.data.email,
            roles: accountData.roles || (accountData.role ? [accountData.role] : res.data.roles),
            firstName: accountData.firstName,
            lastName: accountData.lastName,
            avatarUrl: accountData.avatarUrl,
          });
        } catch (accountErr) {
          console.error('Lỗi lấy thông tin tài khoản từ API /users/account:', accountErr);
        }
        toast.success('Đăng nhập bằng Google thành công!');
        router.replace('/');
      } else {
        toast.error(res.message || 'Đăng nhập Google thất bại.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi đăng nhập bằng Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      toast.error('Chưa cấu hình Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID) trên hệ thống!');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        use_fedcm_for_prompt: false,
      });

      const hiddenContainer = document.getElementById('hidden-google-btn');
      if (hiddenContainer) {
        hiddenContainer.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenContainer, { theme: 'outline', size: 'large' });
        const googleBtn = hiddenContainer.querySelector('div[role="button"]') as HTMLElement;
        if (googleBtn) {
          googleBtn.click();
          return;
        }
      }
      
      window.google.accounts.id.prompt();
    } else {
      toast.error('Hệ thống Google Sign-In đang tải, vui lòng thử lại sau giây lát!');
    }
  };

  return (
    <>
      <div id="hidden-google-btn" className="hidden"></div>
      {/* Social Divider */}
      <div className="mt-5 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-white/90 backdrop-blur-sm px-2 text-zinc-400 font-medium">
            Hoặc đăng nhập bằng
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-60 shadow-sm active:scale-[0.99]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          Đăng nhập bằng Google
        </button>
      </div>
    </>
  );
}
