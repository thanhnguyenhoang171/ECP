'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs, AvatarCropModal } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { ProfileFormValues } from '@/features/profile/schemas/profile.schema';

import { ProfileHeroBanner } from './ProfileHeroBanner';
import { ProfileGeneralTab } from './ProfileGeneralTab';
import { ProfileSecurityTab } from './ProfileSecurityTab';
import { ProfileStatusTab } from './ProfileStatusTab';

export interface ProfileViewProps {
  readonly initialData?: ProfileFormValues;
}

export default function ProfileView({ initialData }: ProfileViewProps): React.JSX.Element {
  const { user, isInitialized } = useAuthStore();
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [avatarResetKey, setAvatarResetKey] = useState<number>(0);

  const activeAvatar = previewAvatarUrl !== null ? previewAvatarUrl : (user?.avatarUrl || '');

  const { mutate: uploadAvatarMutate } = useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (res) => {
      setPreviewAvatarUrl(null);
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
      const msg = getApiErrorMessage(err, 'Cập nhật ảnh đại diện thất bại. Vui lòng thử lại.');
      toast.error(msg, { id: msg });
      setPreviewAvatarUrl(null);
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: user?.avatarUrl || '' } : state.user,
      }));
    },
  });

  const { mutate: deleteAvatarMutate, isPending: isDeletingAvatar } = useMutation({
    mutationFn: authApi.deleteAvatar,
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gỡ ảnh đại diện.');
      setPreviewAvatarUrl(null);
      if (res?.data) {
        const updatedData = res.data;
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updatedData,
              }
            : state.user,
        }));
      } else {
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, avatarUrl: null, avatarPublicId: null } : state.user,
        }));
      }
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err, 'Gỡ ảnh đại diện thất bại. Vui lòng thử lại.');
      toast.error(msg, { id: msg });
      setPreviewAvatarUrl(null);
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: user?.avatarUrl || '' } : state.user,
      }));
    },
  });

  const handleAvatarFileSelect = (val: string | File): void => {
    if (val instanceof File) {
      const blobUrl = URL.createObjectURL(val);
      setCropFile(val);
      setCropImageSrc(blobUrl);
      setIsCropModalOpen(true);
    } else if (typeof val === 'string' && val) {
      setPreviewAvatarUrl(val);
    } else if (!val) {
      setPreviewAvatarUrl('');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: null } : state.user,
      }));
      deleteAvatarMutate();
    }
  };

  const handleCropCancel = (): void => {
    setIsCropModalOpen(false);
    setCropFile(null);
    setCropImageSrc(null);
    setPreviewAvatarUrl(null);
    setAvatarResetKey((prev) => prev + 1);
  };

  const handleCroppedAvatarSave = (croppedFile: File): void => {
    // 0ms Optimistic UI preview
    const blobUrl = URL.createObjectURL(croppedFile);
    setPreviewAvatarUrl(blobUrl);
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, avatarUrl: blobUrl } : state.user,
    }));

    // Close crop modal immediately (0ms wait)
    setIsCropModalOpen(false);
    setCropFile(null);
    setCropImageSrc(null);

    // Immediate success feedback
    toast.success('Cập nhật ảnh đại diện thành công!');

    // Silent background API upload
    uploadAvatarMutate(croppedFile);
  };

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

  const isDataLoading = !isInitialized && !user;

  const activeFullName =
    user?.fullName ||
    ((user?.lastName || user?.firstName) ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : (initialData?.fullName || ''));

  const activeEmail = user?.email || initialData?.email || '';
  const activeRole = getRoleLabel(user?.roles?.[0] || user?.role || initialData?.role);
  const isEmailVerified = user?.emailVerified ?? true;
  const isPhoneVerified = user?.phoneVerified ?? false;
  const isGoogleAccount = user?.provider === 'GOOGLE';

  const createdAtFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Tháng 8, 2026';

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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Hồ sơ quản trị
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Quản lý thông tin định danh, quyền hạn hệ thống và bảo mật tài khoản.
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Hero Banner Card */}
      <ProfileHeroBanner
        activeFullName={activeFullName}
        activeRole={activeRole}
        activeEmail={activeEmail}
        activeAvatar={activeAvatar}
        createdAtFormatted={createdAtFormatted}
        isDataLoading={isDataLoading}
        avatarResetKey={avatarResetKey}
        onAvatarFileSelect={handleAvatarFileSelect}
        isDeletingAvatar={isDeletingAvatar}
      />

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
          {!isGoogleAccount ? (
            <TabsTrigger
              value="security"
              className="rounded-lg text-xs font-bold px-4 py-2 text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs transition-all"
            >
              <KeyRound size={15} className="mr-2" />
              Bảo mật & Mật khẩu
            </TabsTrigger>
          ) : null}
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
          <ProfileGeneralTab
            isDataLoading={isDataLoading}
            initialData={initialData}
          />
        </TabsContent>

        {/* TAB 2: Security & Password (Only for LOCAL auth accounts) */}
        {!isGoogleAccount ? (
          <TabsContent value="security">
            <ProfileSecurityTab />
          </TabsContent>
        ) : null}

        {/* TAB 3: Verification & Security Status */}
        <TabsContent value="status">
          <ProfileStatusTab
            isDataLoading={isDataLoading}
            isEmailVerified={isEmailVerified}
            isPhoneVerified={isPhoneVerified}
          />
        </TabsContent>
      </Tabs>

      {/* Avatar Crop & Zoom Modal */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        onClose={handleCropCancel}
        imageSrc={cropImageSrc}
        file={cropFile}
        onCropSave={handleCroppedAvatarSave}
        isSaving={false}
      />
    </div>
  );
}
