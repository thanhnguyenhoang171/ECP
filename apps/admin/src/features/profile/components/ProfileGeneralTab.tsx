'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  Lock,
  Pencil,
  X,
  Save,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';
import { UpdateUserAccountPayload } from '@/features/auth/types/auth.interface';
import { profileSchema, ProfileFormValues } from '@/features/profile/schemas/profile.schema';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { SpaciousDatePicker } from './SpaciousDatePicker';

const MarsIcon = ({ className }: { readonly className?: string }): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="10" cy="14" r="5" />
    <line x1="19" y1="5" x2="13.5" y2="10.5" />
    <polyline points="14 5 19 5 19 10" />
  </svg>
);

const VenusIcon = ({ className }: { readonly className?: string }): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="9" r="5" />
    <line x1="12" y1="14" x2="12" y2="21" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

export interface ProfileGeneralTabProps {
  readonly isDataLoading: boolean;
  readonly initialData?: ProfileFormValues;
}

export const ProfileGeneralTab = ({
  isDataLoading,
  initialData,
}: ProfileGeneralTabProps): React.JSX.Element => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  const activeFullName =
    user?.fullName ||
    ((user?.lastName || user?.firstName) ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : (initialData?.fullName || ''));

  const activeEmail = user?.email || initialData?.email || '';
  const activePhone = user?.phoneNumber || user?.phone || initialData?.phone || '';
  const activeRole = getRoleLabel(user?.roles?.[0] || user?.role || initialData?.role);
  const activeDob = user?.dob || initialData?.dob || '';
  const activeGender = user?.gender || initialData?.gender || 'MALE';

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: activeFullName,
      email: activeEmail,
      phone: activePhone,
      role: activeRole,
      dob: activeDob,
      gender: activeGender,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: activeFullName,
        email: activeEmail,
        phone: activePhone,
        role: activeRole,
        dob: activeDob,
        gender: activeGender,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: authApi.updateAccountInfo,
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật thông tin thành công!');
      setIsEditing(false);
      if (res?.data) {
        const updatedData = res.data;
        const updatedFullName = `${updatedData.lastName || ''} ${updatedData.firstName || ''}`.trim();
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updatedData,
                fullName: updatedFullName || state.user.fullName,
              }
            : state.user,
        }));
      }
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err, 'Cập nhật thất bại. Vui lòng thử lại.');
      toast.error(msg, { id: msg });
    },
  });

  const handleCancelEdit = (): void => {
    form.reset({
      fullName: activeFullName,
      email: activeEmail,
      phone: activePhone,
      role: activeRole,
      dob: activeDob,
      gender: activeGender,
    });
    setIsEditing(false);
  };

  const onProfileSubmit = (values: ProfileFormValues): void => {
    const dirtyFields = form.formState.dirtyFields;
    const payload: UpdateUserAccountPayload = {};

    if (dirtyFields.fullName) {
      const trimmed = values.fullName.trim();
      const spaceIndex = trimmed.lastIndexOf(' ');
      let firstName = trimmed;
      let lastName = '';

      if (spaceIndex !== -1) {
        lastName = trimmed.substring(0, spaceIndex);
        firstName = trimmed.substring(spaceIndex + 1);
      }

      payload.firstName = firstName;
      payload.lastName = lastName;
    }

    if (dirtyFields.phone) {
      payload.phoneNumber = values.phone;
    }

    if (dirtyFields.dob) {
      payload.dob = values.dob || null;
    }

    if (dirtyFields.gender) {
      payload.gender = values.gender || null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('Không có thông tin nào thay đổi');
      setIsEditing(false);
      return;
    }

    updateProfile(payload);
  };

  return (
    <Card className="border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl">
      <CardHeader className="border-b border-slate-200/80 bg-slate-200/50">
        <CardTitle className="text-slate-900 text-lg font-bold">Hồ sơ người dùng</CardTitle>
        <CardDescription className="text-slate-500 text-xs">
          Cập nhật thông tin liên hệ, ngày sinh, giới tính và chi tiết định danh cá nhân của bạn.
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
                      {isDataLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <Input
                          placeholder="Nhập họ và tên"
                          disabled={!isEditing}
                          {...field}
                          className={cn(
                            'h-11 rounded-xl font-medium transition-all',
                            !isEditing
                              ? 'bg-slate-200/60 border-slate-300 text-slate-600 cursor-not-allowed opacity-90'
                              : 'bg-white border-slate-300 shadow-xs text-slate-900 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                          )}
                        />
                      )}
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
                      {isDataLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="email@ecp.com"
                            disabled
                            {...field}
                            className="pl-10 h-11 bg-slate-200/60 border-slate-300 text-slate-600 font-medium rounded-xl cursor-not-allowed opacity-90"
                          />
                        </div>
                      )}
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
                      {isDataLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Chưa cập nhật"
                            disabled={!isEditing}
                            {...field}
                            className={cn(
                              'pl-10 h-11 rounded-xl font-medium transition-all',
                              !isEditing
                                ? 'bg-slate-200/60 border-slate-300 text-slate-600 cursor-not-allowed opacity-90'
                                : 'bg-white border-slate-300 shadow-xs text-slate-900 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                            )}
                          />
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Ngày sinh
                    </FormLabel>
                    <FormControl>
                      {isDataLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <SpaciousDatePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={!isEditing}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Giới tính
                    </FormLabel>
                    {isDataLoading ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    ) : (
                      <Select
                        disabled={!isEditing}
                        onValueChange={field.onChange}
                        value={field.value || 'MALE'}
                      >
                        <FormControl>
                          <SelectTrigger
                            disabled={!isEditing}
                            className={cn(
                              'h-11 rounded-xl font-medium transition-all',
                              !isEditing
                                ? 'bg-slate-200/60 border-slate-300 text-slate-600 cursor-not-allowed opacity-90'
                                : 'bg-white border-slate-300 shadow-xs text-slate-900 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                            )}
                          >
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border border-slate-200 shadow-lg rounded-xl">
                          <SelectItem value="MALE">
                            <span className="flex items-center gap-2 font-medium">
                              <MarsIcon className="text-blue-600 shrink-0" /> Nam
                            </span>
                          </SelectItem>
                          <SelectItem value="FEMALE">
                            <span className="flex items-center gap-2 font-medium">
                              <VenusIcon className="text-pink-500 shrink-0" /> Nữ
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
                      {isDataLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <Input
                          disabled
                          {...field}
                          className="h-11 bg-slate-200/60 border-slate-300 text-slate-600 font-bold rounded-xl cursor-not-allowed opacity-90"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isDataLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 px-6 h-11 border-b-2 border-blue-800 transition-all active:translate-y-0.5 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Pencil size={16} /> Cập nhật thông tin
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="gap-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl px-5 h-11 text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    <X size={16} /> Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 px-6 h-11 border-b-2 border-emerald-800 transition-all active:translate-y-0.5 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                    {isUpdating ? 'Đang lưu...' : 'Lưu thông tin'}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
