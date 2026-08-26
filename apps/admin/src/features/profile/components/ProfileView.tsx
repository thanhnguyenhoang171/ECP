'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  KeyRound,
  User as UserIcon,
  Loader2,
  Calendar,
  CheckCircle2,
  Lock,
  Clock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs, ImageUpload } from '@/components/common';

import { profileSchema, ProfileFormValues } from '@/features/profile/schemas/profile.schema';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';

interface ProfileViewProps {
  readonly initialData?: ProfileFormValues;
}

export default function ProfileView({ initialData }: ProfileViewProps): React.ReactElement {
  const { user, isInitialized, accessToken } = useAuthStore();

  const getRoleLabel = (role?: string): string => {
    if (!role) return 'Quản trị viên';
    const cleanRole = role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role;
    switch (cleanRole) {
      case 'SUPER_ADMIN':
        return 'Quản trị viên cao cấp';
      case 'ADMIN':
        return 'Quản trị viên';
      case 'MANAGER':
        return 'Quản lý';
      case 'STAFF':
      case 'EMPLOYEE':
        return 'Nhân viên';
      case 'USER':
        return 'Thành viên';
      default:
        return cleanRole;
    }
  };

  // Fetch account info directly from /v1/users/me once session is initialized
  const { data: accountResponse, isLoading: isFetchingMe } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getAccountInfo,
    enabled: isInitialized && Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
  });

  const accountData = accountResponse?.data || accountResponse;

  const activeFullName =
    accountData?.fullName ||
    (accountData?.lastName ? `${accountData.lastName} ${accountData.firstName || ''}`.trim() : accountData?.firstName) ||
    user?.fullName ||
    ((user?.lastName || user?.firstName) ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : (initialData?.fullName || ''));

  const activeEmail = accountData?.email || user?.email || initialData?.email || '';
  const activePhone = accountData?.phoneNumber || accountData?.phone || user?.phoneNumber || user?.phone || initialData?.phone || 'Chưa cập nhật';
  const activeRole = getRoleLabel(accountData?.roles?.[0] || accountData?.role || user?.roles?.[0] || user?.role || initialData?.role);
  const activeAvatar = accountData?.avatarUrl || user?.avatarUrl || '';
  const isEmailVerified = accountData?.emailVerified ?? true;
  const isPhoneVerified = accountData?.phoneVerified ?? false;
  const createdAtFormatted = accountData?.createdAt
    ? new Date(accountData.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Tháng 8, 2026';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: activeFullName,
      email: activeEmail,
      phone: activePhone,
      role: activeRole,
    },
  });

  useEffect(() => {
    if (accountData) {
      form.reset({
        fullName: activeFullName,
        email: activeEmail,
        phone: activePhone,
        role: activeRole,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData]);

  const onProfileSubmit = (_values: ProfileFormValues): void => {
    toast.success('Cập nhật thông tin hồ sơ thành công!');
  };

  const breadcrumbItems = [{ label: 'Hồ sơ cá nhân', icon: UserIcon }];

  return (
    <div className="space-y-6 text-slate-900 pb-12">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl text-slate-500 border-slate-300/80 bg-white hover:bg-slate-100 shrink-0 shadow-xs"
            >
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Hồ sơ quản trị
              {isFetchingMe && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Quản lý thông tin định danh, quyền hạn hệ thống và bảo mật tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Hero Banner Card */}
      <Card className="border border-slate-300/80 bg-slate-100/95 shadow-md overflow-hidden rounded-2xl p-0">
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 flex items-end overflow-hidden">
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.2)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* User Identity Info Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 sm:-mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Floating Avatar Circle */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-white shrink-0 relative">
                <ImageUpload
                  variant="circle"
                  value={activeAvatar}
                  onChange={() => toast.info('Tính năng cập nhật ảnh đại diện đang phát triển')}
                  folder="avatars"
                  description="Đổi ảnh"
                  className="w-full h-full"
                />
              </div>

              {/* User Title & Identity Details */}
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activeFullName || 'Tài khoản Quản trị'}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="px-2.5 py-0.5 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-md shadow-xs"
                  >
                    {activeRole}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {activeEmail}
                </p>
              </div>
            </div>

            {/* Account Quick Meta Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                <Calendar size={14} className="text-blue-600" />
                <span>Tham gia: {createdAtFormatted}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Đã xác thực</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabbed Content Area */}
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="bg-slate-200/70 border border-slate-300/70 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="general"
            className="rounded-lg text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <UserIcon size={15} className="mr-2" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <KeyRound size={15} className="mr-2" />
            Bảo mật & Mật khẩu
          </TabsTrigger>
          <TabsTrigger
            value="status"
            className="rounded-lg text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
          >
            <ShieldCheck size={15} className="mr-2" />
            Trạng thái & Nhật ký
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Personal Details */}
        <TabsContent value="general">
          <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
            <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
              <CardTitle className="text-slate-900 text-lg font-bold">Hồ sơ người dùng</CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Cập nhật thông tin liên hệ và chi tiết định danh cá nhân của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                            Họ và tên
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập họ và tên"
                              {...field}
                              className="bg-white border-slate-300 shadow-xs text-slate-900 font-medium h-11 rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
                            />
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
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                              Địa chỉ Email
                            </FormLabel>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Lock size={10} /> Không thể đổi
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="email@ecp.com"
                                disabled
                                {...field}
                                className="pl-10 h-11 bg-slate-200/60 border-slate-300 text-slate-600 font-medium rounded-xl cursor-not-allowed"
                              />
                            </div>
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
                          <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                            Số điện thoại
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="0912345678"
                                {...field}
                                className="pl-10 h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
                              />
                            </div>
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
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                              Vai trò quản trị
                            </FormLabel>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Lock size={10} /> Do Admin cấp
                            </span>
                          </div>
                          <FormControl>
                            <Input
                              disabled
                              {...field}
                              className="h-11 bg-slate-200/60 border-slate-300 text-slate-600 font-bold rounded-xl cursor-not-allowed"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 px-6 h-11 border-b-2 border-blue-800 transition-all active:translate-y-0.5 text-xs uppercase tracking-wider"
                    >
                      <Save size={16} /> Lưu thông tin
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Security & Password */}
        <TabsContent value="security">
          <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
            <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
              <CardTitle className="text-slate-900 text-lg font-bold">Đổi mật khẩu tài khoản</CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Khuyến nghị đặt mật khẩu mạnh có tối thiểu 8 ký tự bao gồm chữ cái, số và ký tự đặc biệt.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Mật khẩu hiện tại
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Mật khẩu mới
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Xác nhận mật khẩu mới
                  </Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  variant="secondary"
                  className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl px-6 h-11 text-xs uppercase tracking-wider"
                >
                  <KeyRound size={16} /> Cập nhật mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Verification & Security Status */}
        <TabsContent value="status">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
              <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
                <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  Xác thực Email
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Trạng thái Email:</span>
                  {isEmailVerified ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      ✓ Đã xác thực
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      ! Chưa xác thực
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Email chính thức dùng để nhận thông báo khẩn cấp và mã xác thực hệ thống.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
              <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
                <CardTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <Phone size={18} className="text-blue-600" />
                  Xác thực Số điện thoại
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Trạng thái SĐT:</span>
                  {isPhoneVerified ? (
                    <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      ✓ Đã xác thực
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-300 bg-slate-50 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      Chưa xác thực
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bảo vệ tài khoản với tính năng xác thực 2 lớp qua SMS khi cần thiết.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
