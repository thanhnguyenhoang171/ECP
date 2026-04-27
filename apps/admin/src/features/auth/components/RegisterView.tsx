'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { registerSchema, RegisterFormValues } from "@/features/auth/schemas/auth.schema";

export default function RegisterView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
      agreement: false,
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    console.log(values);
    
    setTimeout(() => {
      toast.success('Đăng ký tài khoản thành công!');
      router.push('/login');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 animate-page-fade-in">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-extrabold text-primary italic">ECP Admin</CardTitle>
          <CardDescription className="text-muted-foreground">
            Tạo tài khoản quản trị mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Tên người dùng" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Địa chỉ Email" className="pl-10" {...field} />
                      </div>
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
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Mật khẩu" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Xác nhận mật khẩu" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreement"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="agreement" 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                      <label 
                        htmlFor="agreement" 
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Tôi đồng ý với <Link href="#" className="text-primary hover:underline">điều khoản dịch vụ</Link>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 text-base font-bold mt-2" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng ký ngay
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
