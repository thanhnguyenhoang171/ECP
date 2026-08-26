'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Lock, Loader2, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { loginSchema, LoginFormValues } from '@/features/auth/schemas/auth.schema';
import { useLogin, useGoogleLogin } from '../hooks/use-auth-mutation';

interface GoogleCredentialResponse {
  readonly credential?: string;
}

interface GoogleAccountsId {
  readonly initialize: (config: {
    readonly client_id: string;
    readonly callback: (res: GoogleCredentialResponse) => void;
    readonly use_fedcm_for_prompt?: boolean;
  }) => void;
  readonly renderButton: (parent: HTMLElement, options: { readonly theme?: string; readonly size?: string }) => void;
  readonly prompt: () => void;
}

interface GoogleGlobal {
  readonly accounts?: {
    readonly id?: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

export default function LoginView(): React.ReactElement {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  useEffect(() => {
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

  const handleGoogleCredential = (credentialResponse: GoogleCredentialResponse): void => {
    if (!credentialResponse.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google.');
      return;
    }
    googleLoginMutation.mutate(credentialResponse.credential);
  };

  const handleGoogleLogin = (): void => {
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

      const hiddenContainer = document.getElementById('hidden-google-btn-admin');
      if (hiddenContainer) {
        hiddenContainer.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenContainer, { theme: 'outline', size: 'large' });
        const googleBtn = hiddenContainer.querySelector('div[role="button"]') as HTMLElement | null;
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = (values: LoginFormValues): void => {
    loginMutation.mutate(values);
  };

  const isLoading = loginMutation.isPending;
  const isGoogleLoading = googleLoginMutation.isPending;
  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-slate-100 overflow-hidden">
      {/* Background Dot Grid & Ambient Blue Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto py-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative h-16 w-16 mb-3 overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <Image
              src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg"
              alt="Logo ECP"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ECP ADMIN</h1>
          <p className="text-xs text-slate-400 font-medium">Hệ thống quản trị thương mại điện tử</p>
        </div>

        {/* Subtle Light Gray Form Card with Heavy Drop Shadow */}
        <Card className="border border-slate-300/80 bg-slate-100/95 text-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="space-y-1.5 pt-7 pb-5 px-6 sm:px-8 border-b border-slate-200/80 bg-slate-200/50 text-center">
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Đăng nhập</CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Nhập thông tin tài khoản quản trị của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                        Địa chỉ Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="admin@ecp.com"
                            disabled={isAnyLoading}
                            {...field}
                            className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                          Mật khẩu
                        </FormLabel>
                        <Link href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            disabled={isAnyLoading}
                            {...field}
                            className="pl-10 pr-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isAnyLoading}
                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2.5 py-1">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isAnyLoading}
                          className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 bg-white"
                        />
                        <label
                          htmlFor="remember"
                          className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                        >
                          Duy trì đăng nhập trên thiết bị này
                        </label>
                      </div>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 border-b-2 border-blue-800 transition-all active:border-b-0 active:translate-y-0.5 disabled:opacity-50 text-sm"
                  disabled={isAnyLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Đăng nhập hệ thống <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div id="hidden-google-btn-admin" className="hidden" />

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300/80" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-100/95 px-3 text-slate-500 font-semibold text-[10px] tracking-wider">
                      Hoặc đăng nhập bằng
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  onClick={handleGoogleLogin}
                  disabled={isAnyLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang kết nối Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Google Workspace Single Sign-On
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <div className="border-t border-slate-200/80 bg-slate-200/50 p-5 text-center">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản quản trị?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Đăng ký tài khoản mới
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2024 ECP Enterprise System. Tất cả các quyền được bảo hộ.
        </p>
      </div>
    </div>
  );
}
