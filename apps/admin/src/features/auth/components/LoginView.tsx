'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { loginSchema, LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { useLogin, useGoogleLogin } from "../hooks/use-auth-mutation";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginView() {
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleCredential = (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      toast.error('Không nhận được thông tin xác thực từ Google.');
      return;
    }
    googleLoginMutation.mutate(credentialResponse.credential);
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

      const hiddenContainer = document.getElementById('hidden-google-btn-admin');
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  const isLoading = loginMutation.isPending;

  return (
    <div className="relative flex flex-col items-center min-h-dvh overflow-y-auto py-10 px-4">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background/default.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-20 w-20 mb-4 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl">
            <Image 
              src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg" 
              alt="Logo" 
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter drop-shadow-lg text-center">CACAO ADMIN</h1>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-slate-50/50 border-b px-5 sm:px-8">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-slate-900">Đăng nhập</CardTitle>
            <CardDescription className="text-center text-slate-500 text-xs sm:text-sm">
              Nhập thông tin để truy cập hệ thống quản trị
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-sm sm:base">Địa chỉ Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <Input 
                            type="email"
                            placeholder="admin@ecp.com" 
                            {...field} 
                            className="pl-9 sm:pl-10 h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-sm sm:base">Mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field} 
                            className="pl-9 sm:pl-10 pr-9 sm:pr-10 h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between py-0.5 sm:py-1">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                        <label 
                          htmlFor="remember" 
                          className="text-xs sm:text-sm font-medium text-slate-600 cursor-pointer select-none"
                        >
                          Ghi nhớ
                        </label>
                      </div>
                    )}
                  />
                  <Link href="#" className="text-xs text-primary font-bold hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm sm:text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    "Đăng nhập hệ thống"
                  )}
                </Button>

                <div id="hidden-google-btn-admin" className="hidden"></div>

                <div className="relative my-3 sm:my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-medium text-[10px] tracking-wider">Hoặc</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || googleLoginMutation.isPending}
                >
                  {googleLoginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  Đăng nhập bằng Google
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col border-t bg-slate-50/50 p-5 sm:p-6">
            <div className="text-center text-xs sm:text-sm text-slate-500">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 flex flex-col items-center space-y-2">
          <p className="text-center text-xs text-slate-300">
            &copy; 2024 Cacao Enterprise. Tất cả các quyền được bảo hộ.
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link href="#" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="#" className="hover:text-white transition-colors">Hỗ trợ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
