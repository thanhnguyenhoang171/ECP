'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Save, 
  Camera, 
  KeyRound,
  Loader2
} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const profileSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  role: z.string(),
});

export default function ProfilePage() {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Admin User",
      email: "admin@ecp.vn",
      phone: "0987654321",
      role: "Quản trị viên",
    },
  });

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    console.log(values);
    toast.success("Cập nhật thông tin thành công!");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold italic">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={16} />
                  </Button>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Admin User</h2>
                  <p className="text-sm text-muted-foreground">admin@ecp.vn</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-3 py-1">Quản trị viên</Badge>
                  <Badge className="bg-green-500 hover:bg-green-600 px-3 py-1">Active</Badge>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>admin@ecp.vn</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>0987654321</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Quyền truy cập cao nhất</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Forms */}
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
                <Button variant="outline" className="gap-2">
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
