'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User, Lock, Loader2 } from 'lucide-react';
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

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Tên đăng nhập phải có ít nhất 2 ký tự.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
  remember: z.boolean().default(false),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    
    setTimeout(() => {
      localStorage.setItem('access_token', 'fake_token_123');
      toast.success('Chào mừng bạn quay trở lại!');
      router.push('/dashboard');
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-extrabold text-primary italic">ECP Admin</CardTitle>
          <CardDescription className="text-muted-foreground">
            Hệ thống quản trị bán hàng hiện đại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Tên đăng nhập (admin)" className="pl-10" {...field} />
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

              <div className="flex items-center justify-between">
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
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ghi nhớ tôi
                      </label>
                    </div>
                  )}
                />
                <Link href="#" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-2">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
