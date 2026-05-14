'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Loader2, Package, Eye, EyeOff, UserPlus } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { registerSchema, RegisterFormValues } from "@/features/auth/schemas/auth.schema";

export default function RegisterView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      confirm: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        toast.error(result.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
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
        style={{ backgroundImage: "url('/background/ocean.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg my-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter drop-shadow-lg text-center">ECP ADMIN</h1>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-slate-50/50 border-b px-5 sm:px-8">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-slate-900">Tạo tài khoản</CardTitle>
            <CardDescription className="text-center text-slate-500 text-xs sm:text-sm">
              Điền thông tin của bạn để bắt đầu
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
                      <FormLabel className="text-slate-700 font-semibold text-sm sm:text-base">Tên đăng nhập</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                          <Input 
                            placeholder="username" 
                            {...field} 
                            className="pl-9 sm:pl-10 h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm sm:text-base">Họ</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nguyễn" 
                            {...field} 
                            className="h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm sm:text-base">Tên</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Thành" 
                            {...field} 
                            className="h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
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
                        <FormLabel className="text-slate-700 font-semibold text-sm sm:text-base">Mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field} 
                              className="pl-9 sm:pl-10 h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
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

                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold text-sm sm:text-base">Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field} 
                              className="pl-9 sm:pl-10 h-10 sm:h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm sm:text-base"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg mt-2 sm:mt-4 active:scale-[0.98] text-sm sm:text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Đăng ký tài khoản
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col border-t bg-slate-50/50 p-5 sm:p-6">
            <div className="text-center text-xs sm:text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-300 mt-8">
          &copy; 2024 ECP Enterprise. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}
