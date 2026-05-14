'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Loader2, Package, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";

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
import { useAuthStore } from "@/store/authStore";

export default function LoginView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          remember: values.remember,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user = result.data.user;
        
        // Chặn người dùng có role là USER truy cập vào admin
        const isRestricted = user.roles.includes('ROLE_USER') && 
                           !user.roles.includes('ROLE_SUPER_ADMIN') && 
                           !user.roles.includes('ROLE_MANAGER');

        if (isRestricted) {
          toast.error('Tài khoản của bạn không có quyền truy cập hệ thống quản trị');
          setIsLoading(false);
          return;
        }

        setAuth(result.data.accessToken, user);
        toast.success('Chào mừng bạn quay trở lại!');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center min-h-screen py-10 px-4">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background/default.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter drop-shadow-lg text-center">ECP ADMIN</h1>
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-sm sm:base">Tên đăng nhập / Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <Input 
                            placeholder="admin@example.com" 
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
            &copy; 2024 ECP Enterprise. Tất cả các quyền được bảo hộ.
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
