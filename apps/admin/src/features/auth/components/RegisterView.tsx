'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Lock, Loader2, Eye, EyeOff, UserPlus, Mail, User } from 'lucide-react';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { registerSchema, RegisterFormValues } from '@/features/auth/schemas/auth.schema';
import { useRegister } from '../hooks/use-auth-mutation';

export default function RegisterView(): React.ReactElement {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirm: '',
    },
  });

  const onSubmit = (values: RegisterFormValues): void => {
    registerMutation.mutate(values);
  };

  const isLoading = registerMutation.isPending;
  const passwordValue = form.watch('password') || '';
  const confirmValue = form.watch('confirm') || '';

  const isPasswordMatched = confirmValue.length > 0 && passwordValue === confirmValue;

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-4 sm:p-6 bg-slate-900 text-slate-100 overflow-hidden">
      {/* Background Dot Grid & Ambient Blue Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto py-8">
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
          <p className="text-xs text-slate-400 font-medium">Đăng ký tài khoản quản trị mới</p>
        </div>

        {/* Subtle Light Gray Register Card with Heavy Drop Shadow */}
        <Card className="border border-slate-300/80 bg-slate-100/95 text-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="space-y-1.5 pt-7 pb-5 px-6 sm:px-8 border-b border-slate-200/80 bg-slate-200/50 text-center">
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản</CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Điền đầy đủ thông tin bên dưới để gửi yêu cầu khởi tạo tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
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
                            placeholder="user@ecp.com"
                            disabled={isLoading}
                            {...field}
                            className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                          Họ & Tên đệm
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                              placeholder="Nguyễn Văn"
                              disabled={isLoading}
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
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                          Tên
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Thành"
                            disabled={isLoading}
                            {...field}
                            className="px-4 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                          Mật khẩu
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              disabled={isLoading}
                              {...field}
                              className="pl-10 pr-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
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

                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
                            Xác nhận mật khẩu
                          </FormLabel>
                          {confirmValue.length > 0 && (
                            <span className={`text-[10px] font-bold ${isPasswordMatched ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {isPasswordMatched ? '✓ Khớp' : '✕ Chưa khớp'}
                            </span>
                          )}
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              disabled={isLoading}
                              {...field}
                              className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm font-medium"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 border-b-2 border-blue-800 transition-all active:border-b-0 active:translate-y-0.5 disabled:opacity-50 text-sm mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" /> Đăng ký tài khoản
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <div className="border-t border-slate-200/80 bg-slate-200/50 p-5 text-center">
            <p className="text-xs text-slate-500">
              Đã có tài khoản quản trị?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Quay lại Đăng nhập
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; 2024 ECP Enterprise System. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}
