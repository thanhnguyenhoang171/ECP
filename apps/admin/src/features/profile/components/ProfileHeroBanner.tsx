'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Trash2, Loader2, Mail, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';
import { getApiErrorMessage } from '@/constants/errorMessages';

export interface ProfileHeroBannerProps {
  readonly activeFullName: string;
  readonly activeRole: string;
  readonly activeEmail: string;
  readonly activeAvatar: string;
  readonly createdAtFormatted: string;
  readonly isDataLoading: boolean;
  readonly avatarResetKey: number;
  readonly onAvatarFileSelect: (val: string | File) => void;
  readonly isDeletingAvatar: boolean;
}

export const ProfileHeroBanner = ({
  activeFullName,
  activeRole,
  activeEmail,
  activeAvatar,
  createdAtFormatted,
  isDataLoading,
  avatarResetKey,
  onAvatarFileSelect,
  isDeletingAvatar,
}: ProfileHeroBannerProps): React.JSX.Element => {
  const { user } = useAuthStore();
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const activeBanner = previewBannerUrl !== null ? previewBannerUrl : (user?.bannerUrl || '');

  const { mutate: uploadBannerMutate, isPending: isUploadingBanner } = useMutation({
    mutationFn: authApi.uploadBanner,
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật ảnh nền thành công!');
      setPreviewBannerUrl(null);
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
      }
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err, 'Cập nhật ảnh nền thất bại. Vui lòng thử lại.');
      toast.error(msg, { id: msg });
      setPreviewBannerUrl(null);
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, bannerUrl: user?.bannerUrl || '' } : state.user,
      }));
    },
  });

  const { mutate: deleteBannerMutate, isPending: isDeletingBanner } = useMutation({
    mutationFn: authApi.deleteBanner,
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gỡ ảnh nền.');
      setPreviewBannerUrl(null);
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
          user: state.user ? { ...state.user, bannerUrl: null, bannerPublicId: null } : state.user,
        }));
      }
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err, 'Gỡ ảnh nền thất bại. Vui lòng thử lại.');
      toast.error(msg, { id: msg });
      setPreviewBannerUrl(null);
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, bannerUrl: user?.bannerUrl || '' } : state.user,
      }));
    },
  });

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tập tin hình ảnh hợp lệ');
      return;
    }

    // 0ms Optimistic UI preview
    const blobUrl = URL.createObjectURL(file);
    setPreviewBannerUrl(blobUrl);
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, bannerUrl: blobUrl } : state.user,
    }));

    uploadBannerMutate(file);

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveBanner = (): void => {
    // 0ms Optimistic UI removal
    setPreviewBannerUrl('');
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, bannerUrl: null } : state.user,
    }));

    deleteBannerMutate();
  };

  return (
    <Card className="border border-slate-300/80 bg-slate-100/95 shadow-md overflow-hidden rounded-2xl p-0">
      <input
        type="file"
        ref={bannerInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleBannerFileSelect}
      />
      <div className="relative h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 flex items-end overflow-hidden group">
        {activeBanner ? (
          <Image
            src={activeBanner}
            alt="Profile Banner"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            unoptimized
          />
        ) : null}

        {/* Gradient & Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-black/20 pointer-events-none z-1" />
        {!activeBanner && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.2)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Top Right Action Controls for Banner */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {activeBanner && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemoveBanner}
              disabled={isUploadingBanner || isDeletingBanner}
              className="h-8 px-2.5 text-xs font-bold bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Gỡ ảnh nền"
            >
              <Trash2 className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Gỡ ảnh nền</span>
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => bannerInputRef.current?.click()}
            disabled={isUploadingBanner || isDeletingBanner}
            className="h-8 px-2.5 text-xs font-bold bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isUploadingBanner ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>{activeBanner ? 'Đổi ảnh nền' : 'Tải ảnh nền'}</span>
          </Button>
        </div>
      </div>

      {/* User Identity Info Row */}
      <div className="px-6 sm:px-8 pb-6 pt-0 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Floating Avatar Circle */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-white shrink-0 relative z-20">
              {isDataLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : (
                <>
                  <ImageUpload
                    key={avatarResetKey}
                    variant="circle"
                    value={activeAvatar}
                    onChange={onAvatarFileSelect}
                    allowReplace={true}
                    showRemove={false}
                    deferUpload={true}
                    folder="avatars"
                    description="Đổi ảnh"
                    className="w-full h-full"
                  />
                  {isDeletingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white pointer-events-none rounded-full z-30 animate-in fade-in">
                      <Loader2 className="h-6 w-6 animate-spin text-white mb-1" />
                      <span className="text-[10px] font-bold tracking-tight">Đang xử lý...</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Title & Identity Details */}
            <div className="space-y-1.5 pb-1">
              {isDataLoading ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-7 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Account Quick Meta Chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 pt-2">
            {isDataLoading ? (
              <>
                <Skeleton className="h-8 w-36 rounded-xl" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                  <CalendarIcon size={14} className="text-blue-600" />
                  <span>Tham gia: {createdAtFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Đã xác thực</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
