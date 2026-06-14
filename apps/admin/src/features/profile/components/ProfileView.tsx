'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Camera,
  KeyRound,
} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/common";
import { User as UserIcon } from "lucide-react";

import { profileSchema, ProfileFormValues } from "@/features/profile/schemas/profile.schema";
import { ImageUpload } from "@/components/common";

interface ProfileViewProps {
  initialData: ProfileFormValues;
}

export default function ProfileView({ initialData }: ProfileViewProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  function onProfileSubmit(values: ProfileFormValues) {
    console.log(values);
    toast.success("Cập nhật thông tin thành công!");
  }

  const breadcrumbItems = [
    { label: 'Hồ sơ cá nhân', icon: UserIcon },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg text-slate-500 border-slate-200 hover:bg-slate-100 shrink-0">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-32 h-32 relative">
                  <ImageUpload 
                    variant="circle"
                    value=""
                    onChange={(url) => toast.info('Tính năng cập nhật ảnh đại diện đang phát triển')}
                    description="Đổi ảnh"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{initialData.fullName}</h2>
                  <p className="text-sm text-slate-400">{initialData.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase tracking-wider">{initialData.role}</Badge>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 border-none font-bold text-[10px] uppercase tracking-wider">Hoạt động</Badge>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{initialData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{initialData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Quyền truy cập cao nhất</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Cập nhật thông tin liên hệ của bạn tại đây.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập email" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số điện thoại" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vai trò</FormLabel>
                          <FormControl>
                            <Input disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="gap-2">
                      <Save size={16} /> Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bảo mật</CardTitle>
              <CardDescription>Thay đổi mật khẩu để bảo vệ tài khoản của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mật khẩu hiện tại</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mật khẩu mới</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Xác nhận mật khẩu mới</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="secondary" className="gap-2">
                  <KeyRound size={16} /> Cập nhật mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
