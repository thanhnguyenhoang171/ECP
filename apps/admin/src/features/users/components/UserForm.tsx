'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus, Save } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userSchema, UserFormValues } from '../schemas/user.schema';
import { useCreateUser, useUpdateUser } from '../hooks/use-users';
import { AdminFormLabel } from '@/components/common';

interface UserFormProps {
  onSuccess: () => void;
  initialData?: UserFormValues;
  userId?: string;
}

export default function UserForm({ onSuccess, initialData, userId }: UserFormProps) {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const isEdit = !!initialData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'USER',
      status: 'active',
      password: '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = (values: UserFormValues) => {
    // Validate password for new user
    if (!isEdit && !values.password) {
      form.setError('password', { type: 'custom', message: 'Mật khẩu bắt buộc đối với nhân viên mới' });
      return;
    }

    if (isEdit && userId) {
      updateUserMutation.mutate(
        { id: userId, data: values },
        {
          onSuccess: () => {
            form.reset();
            onSuccess();
          },
        }
      );
    } else {
      createUserMutation.mutate(values, {
        onSuccess: () => {
          form.reset();
          onSuccess();
        },
      });
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên tài khoản */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required>Tên đăng nhập</AdminFormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập tên đăng nhập (vd: staff_lan)..." 
                    disabled={isEdit || isLoading} 
                    className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Họ và tên */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required>Họ và tên</AdminFormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập họ và tên đầy đủ..." 
                    disabled={isLoading} 
                    className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required>Email</AdminFormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="Nhập địa chỉ email..." 
                    disabled={isLoading} 
                    className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Số điện thoại */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required>Số điện thoại</AdminFormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập số điện thoại (vd: 0912345678)..." 
                    disabled={isLoading} 
                    className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vai trò */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required>Vai trò</AdminFormLabel>
                <Select
                  disabled={isLoading || (isEdit && initialData?.role === 'SUPER_ADMIN')}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 text-sm focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Chọn vai trò cho nhân viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="USER" className="text-sm cursor-pointer">Nhân viên (User)</SelectItem>
                    <SelectItem value="MANAGER" className="text-sm cursor-pointer">Quản lý (Manager)</SelectItem>
                    <SelectItem value="SUPER_ADMIN" className="text-sm cursor-pointer">Quản trị viên (Super Admin)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mật khẩu */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel required={!isEdit}>
                  Mật khẩu {isEdit && <span className="text-[10px] text-slate-400 font-normal">(để trống nếu không đổi)</span>}
                </AdminFormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder={isEdit ? "••••••••" : "Nhập mật khẩu..."} 
                    disabled={isLoading} 
                    className="h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Trạng thái hoạt động */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50">
              <div className="space-y-0.5">
                <AdminFormLabel className="text-slate-800">Trạng thái tài khoản</AdminFormLabel>
                <FormDescription className="text-[10px] text-slate-400">Cho phép nhân viên đăng nhập vào hệ thống vận hành.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === 'active'}
                  onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                  disabled={isLoading || (isEdit && initialData?.role === 'SUPER_ADMIN')}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isLoading}
            className="font-bold flex items-center gap-1.5 shadow-md h-10 px-5"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEdit ? (
              <Save size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            {isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
