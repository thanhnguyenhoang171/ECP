'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Loader2, Package } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { loginSchema, LoginFormValues } from "@/features/auth/schemas/auth.schema";

import { useAuthStore } from "@/store/authStore";

export default function LoginView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAuth(result.data.accessToken, result.data.user);
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-3 rounded-2xl shadow-lg mb-4">
            <Package className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ECP Admin</h1>
          <p className="text-slate-500 mt-2">Đăng nhập vào hệ thống quản trị</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin tài khoản của bạn bên dưới
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập / Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@example.com" 
                          {...field} 
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mật khẩu</FormLabel>
                        <Link href="#" className="text-xs text-primary font-semibold hover:underline">
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          {...field} 
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        className="text-sm font-medium text-slate-600 cursor-pointer select-none"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Đăng nhập
                </Button>

                <div className="text-center text-sm text-slate-500 pt-2">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-primary font-bold hover:underline">
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2024 ECP Admin. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}
