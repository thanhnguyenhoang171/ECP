'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Image as ImageIcon, Info, ShieldCheck, KeyRound, Upload, Camera } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userSchema, UserFormValues } from '../schemas/user.schema';
import { useCreateUser, useUpdateUser } from '../hooks/use-users';
import { FormSection, FormGrid, AdminFormLabel, FormActionsBar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import AvatarCropModal from '@/components/common/AvatarCropModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { User } from '../types/user.interface';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: User | null;
  userId?: string;
  isDialog?: boolean;
  isLoadingData?: boolean;
}

export default function UserForm({ onSuccess, onCancel, initialData, userId, isDialog = false, isLoadingData = false }: UserFormProps) {
  const { user: currentUser } = useAuthStore();
  const operatorRole = currentUser?.role || (currentUser?.roles && currentUser.roles[0]) || '';
  const isSuperAdmin = operatorRole === 'SUPER_ADMIN' || operatorRole === 'ROLE_SUPER_ADMIN';

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const [isUploading, setIsUploading] = useState(false);
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState<'general'>('general');

  // Crop Modal state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      fullName: '',
      email: '',
      phone: '',
      role: 'USER',
      status: 'active',
      password: '',
      avatarUrl: '',
      avatarPublicId: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        avatarUrl: initialData.avatarUrl || '',
        avatarPublicId: initialData.avatarPublicId || '',
      });
    }
  }, [initialData, form]);

  const onSubmit = (values: UserFormValues) => {
    if (isUploading) {
      toast.warning('Ảnh đang được tải lên Cloudinary, vui lòng chờ trong giây lát!');
      return;
    }

    if (!isEdit && !values.password) {
      form.setError('password', { type: 'custom', message: 'Mật khẩu bắt buộc đối với người dùng mới' });
      return;
    }

    if (isEdit && userId) {
      const dirtyFields = form.formState.dirtyFields;
      const partialData: Partial<UserFormValues> = {};

      if (dirtyFields.fullName) partialData.fullName = values.fullName;
      if (dirtyFields.email) partialData.email = values.email;
      if (dirtyFields.phone) partialData.phone = values.phone;
      if (dirtyFields.role) partialData.role = values.role;
      if (dirtyFields.status) partialData.status = values.status;
      if (dirtyFields.password && values.password) partialData.password = values.password;
      if (dirtyFields.avatarUrl) partialData.avatarUrl = values.avatarUrl;
      if (dirtyFields.avatarPublicId) partialData.avatarPublicId = values.avatarPublicId;

      if (Object.keys(partialData).length === 0) {
        toast.info('Không có thông tin nào thay đổi');
        onSuccess();
        return;
      }

      updateUserMutation.mutate(
        { id: userId, data: partialData },
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

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending || isUploading;
  const currentAvatarUrl = form.watch('avatarUrl');
  const currentFullName = form.watch('fullName');

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước tệp quá lớn (tối đa 5MB)");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setRawImageSrc(imageUrl);
    setIsCropOpen(true);

    // Reset input value so re-selecting the same file works
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    form.setValue('avatarUrl', croppedFile as any, { shouldValidate: true, shouldDirty: true });
    setIsCropOpen(false);
    toast.success("Đã chọn và cắt ảnh đại diện!");
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", isDialog ? "pb-2" : "pb-24")}>
        
        {/* Navigation Tabs Header */}
        {!isDialog && (
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px scrollbar-none bg-slate-50/50 p-1.5 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all bg-white text-blue-600 shadow-sm border border-slate-200/50"
                >
                  <Icon size={14} className="text-blue-600" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 2-Column Main Layout Grid */}
        <div className={cn("grid grid-cols-1 gap-8 animate-in fade-in-30", !isDialog && "lg:grid-cols-12")}>
          
          {/* Cột trái (8 cột): Thông tin cá nhân, Phân quyền & Bảo mật */}
          <div className={cn("space-y-6", !isDialog && "lg:col-span-8")}>
            
            {/* Section 1: Thông tin cơ bản */}
            <FormSection
              title="Thông tin cơ bản"
              description="Nhập các thông tin định danh chính của tài khoản."
            >
              <FormGrid cols={2}>
                {/* Họ và tên */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <AdminFormLabel required>Họ và tên</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <Input 
                            placeholder="Nhập họ và tên đầy đủ..." 
                            disabled={isLoading} 
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            {...field} 
                          />
                        )}
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
                      <AdminFormLabel required>Email đăng nhập</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <Input 
                            type="email"
                            placeholder="Nhập địa chỉ email..." 
                            disabled={isLoading} 
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            {...field} 
                          />
                        )}
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
                    <FormItem className="space-y-1.5 md:col-span-2">
                      <AdminFormLabel required>Số điện thoại</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <Input 
                            placeholder="Nhập số điện thoại liên hệ (vd: 0912345678)..." 
                            disabled={isLoading} 
                            className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm" 
                            {...field} 
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Section 2: Phân loại & Hiển thị */}
            <FormSection
              title="Phân loại & Hiển thị"
              description="Cấu hình vai trò hệ thống và trạng thái tài khoản."
            >
              <FormGrid cols={2}>
                {/* Vai trò */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <AdminFormLabel required>Vai trò hệ thống</AdminFormLabel>
                      <Select
                        disabled={isLoading || (isEdit && initialData?.role === 'SUPER_ADMIN')}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                            <SelectValue placeholder="Chọn vai trò cho tài khoản" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="USER" className="text-sm cursor-pointer">Khách hàng (User)</SelectItem>
                          <SelectItem value="MANAGER" className="text-sm cursor-pointer">Quản lý (Manager)</SelectItem>
                          {isSuperAdmin && (
                            <SelectItem value="SUPER_ADMIN" className="text-sm cursor-pointer">Admin (Super Admin)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trạng thái hoạt động */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 mt-1">
                      <div className="space-y-0.5">
                        <AdminFormLabel className="text-slate-800">Kích hoạt tài khoản</AdminFormLabel>
                        <FormDescription className="text-[10px] text-slate-400">Cho phép truy cập sắm hoặc quản trị.</FormDescription>
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
              </FormGrid>
            </FormSection>

            {/* Section 3: Bảo mật */}
            <FormSection
              title="Bảo mật tài khoản"
              description="Đặt mật khẩu đăng nhập mới"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <AdminFormLabel required={!isEdit}>
                      Mật khẩu truy cập {isEdit && <span className="text-[10px] text-slate-400 font-normal">(Đóng băng / Để trống nếu giữ nguyên)</span>}
                    </AdminFormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder={isEdit ? "•••••••• (Để trống nếu giữ nguyên mật khẩu cũ)" : "Nhập mật khẩu truy cập mới..."} 
                        disabled={isLoading} 
                        className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </div>

          {/* Cột phải (4 cột): Hình ảnh đại diện Avatar */}
          <div className={cn("space-y-6", !isDialog && "lg:col-span-4")}>
            <FormSection
              title="Hình ảnh đại diện"
              description="Ảnh đại diện hiển thị đại diện cho tài khoản người dùng."
            >
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all text-center group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group/avatar cursor-pointer mb-4"
                    title="Click để chọn & đổi ảnh đại diện mới"
                  >
                    <Avatar className="h-28 w-28 border-4 border-white shadow-lg ring-1 ring-slate-200/80 overflow-hidden">
                      {currentAvatarUrl && (
                        <AvatarImage 
                          src={typeof currentAvatarUrl === 'string' ? currentAvatarUrl : ((currentAvatarUrl as any) instanceof File ? URL.createObjectURL(currentAvatarUrl as any) : '')} 
                          alt={currentFullName || 'Avatar'} 
                          className="object-cover" 
                        />
                      )}
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-2xl">
                        {getInitials(currentFullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-all duration-300">
                      <Camera size={20} className="mb-0.5" />
                      <span className="text-[9px] font-bold tracking-tight uppercase">Đổi ảnh</span>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border-slate-200 gap-1.5 shadow-sm rounded-xl"
                  >
                    <Upload size={14} className="text-blue-600" />
                    <span>Tải ảnh lên & Cắt ảnh</span>
                  </Button>
                  <p className="text-[11px] text-slate-400 mt-2">Hỗ trợ JPG, PNG, WebP (Tối đa 5MB)</p>
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        {/* Avatar Crop Modal */}
        <AvatarCropModal
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
        />

        {/* Form Actions Bar */}
        <FormActionsBar
          onCancel={onCancel || onSuccess}
          isSubmitting={isLoading}
          submitText={isEdit ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
          activeTabLabel={isEdit ? `Chỉnh sửa: ${currentFullName}` : 'Tạo người dùng mới'}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
