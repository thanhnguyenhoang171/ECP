'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  KeyRound,
  User as UserIcon,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Camera,
  Trash2,
} from 'lucide-react';

const MarsIcon = ({ className }: { className?: string }) => (
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

const VenusIcon = ({ className }: { className?: string }) => (
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

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/constants/errorMessages';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs, ImageUpload, AvatarCropModal } from '@/components/common';
import { cn } from '@/lib/utils';

import { profileSchema, ProfileFormValues } from '@/features/profile/schemas/profile.schema';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api/auth.api';
import { fileApi } from '@/features/files/api/file.api';
import { UpdateUserAccountPayload } from '@/features/auth/types/auth.interface';

interface ProfileViewProps {
  readonly initialData?: ProfileFormValues;
}

interface SpaciousDatePickerProps {
  value?: string;
  onChange: (dateStr: string) => void;
  disabled?: boolean;
}

function SpaciousDatePicker({ value, onChange, disabled }: SpaciousDatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsedDate = value ? new Date(value) : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : 1995;
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : 4; // May

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;
    if (newOpen && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
    setOpen(newOpen);
  };

  const years = Array.from({ length: 77 }, (_, i) => 1950 + i); // 1950 to 2026
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(formatted);
    setOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const displayValue = value
    ? (() => {
        const parts = value.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return value;
      })()
    : '';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all',
            disabled ? 'cursor-not-allowed bg-slate-200/60 border-slate-300 text-slate-500 opacity-90' : 'cursor-pointer'
          )}
        >
          <span className={cn(displayValue ? (disabled ? 'text-slate-600 font-semibold' : 'text-slate-900 font-semibold') : 'text-slate-400')}>
            {displayValue || 'Chọn ngày sinh...'}
          </span>
          <CalendarIcon size={18} className={disabled ? 'text-slate-400 shrink-0' : 'text-blue-600 shrink-0'} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-4 bg-white border border-slate-200 shadow-2xl rounded-2xl space-y-4">
        {/* Month & Year Selectors Header */}
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <Select value={String(viewMonth)} onValueChange={(val) => setViewMonth(Number(val))}>
              <SelectTrigger className="h-8 text-xs font-bold bg-slate-100 border-none rounded-lg px-2 shadow-none cursor-pointer">
                <SelectValue>{months[viewMonth]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl max-h-56">
                {months.map((m, idx) => (
                  <SelectItem key={idx} value={String(idx)} className="text-xs font-medium cursor-pointer">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(viewYear)} onValueChange={(val) => setViewYear(Number(val))}>
              <SelectTrigger className="h-8 text-xs font-bold bg-slate-100 border-none rounded-lg px-2 shadow-none cursor-pointer">
                <SelectValue>{viewYear}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl max-h-56">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs font-medium cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Day Header Labels */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
          <span>CN</span>
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const pad = (n: number) => n.toString().padStart(2, '0');
            const dateString = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
            const isSelected = value === dateString;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'h-9 w-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ProfileView({ initialData }: ProfileViewProps): React.ReactElement {
  const { user, isInitialized } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [avatarResetKey, setAvatarResetKey] = useState<number>(0);

  const handleAvatarFileSelect = (val: string | File) => {
    if (val instanceof File) {
      const blobUrl = URL.createObjectURL(val);
      setCropFile(val);
      setCropImageSrc(blobUrl);
      setIsCropModalOpen(true);
    } else if (typeof val === 'string' && val) {
      setAvatarUrl(val);
    }
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setCropFile(null);
    setCropImageSrc(null);
    setAvatarUrl(user?.avatarUrl || '');
    setAvatarResetKey((prev) => prev + 1);
  };

  const handleCroppedAvatarSave = (croppedFile: File) => {
    // 0ms Optimistic UI preview
    const blobUrl = URL.createObjectURL(croppedFile);
    setAvatarUrl(blobUrl);
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
  const activePhone = user?.phoneNumber || user?.phone || initialData?.phone || '';
  const activeRole = getRoleLabel(user?.roles?.[0] || user?.role || initialData?.role);
  const activeAvatar = avatarUrl || user?.avatarUrl || '';
  const activeBanner = bannerUrl || user?.bannerUrl || '';
  const activeDob = user?.dob || initialData?.dob || '';
  const activeGender = user?.gender || initialData?.gender || 'MALE';
  const isEmailVerified = user?.emailVerified ?? true;
  const isPhoneVerified = user?.phoneVerified ?? false;
  const isGoogleAccount = user?.provider === 'GOOGLE';

  const createdAtFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Tháng 8, 2026';

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
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
      if (user.bannerUrl) {
        setBannerUrl(user.bannerUrl);
      }
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

  // Mutation for updating user account details via PUT /v1/users/me
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: authApi.updateAccountInfo,
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật thông tin tài khoản thành công!');
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

  const { mutate: uploadAvatarMutate } = useMutation({
    mutationFn: authApi.uploadAvatar,
    onSuccess: (res) => {
      if (res?.data) {
        const updatedData = res.data;
        const updatedFullName = `${updatedData.lastName || ''} ${updatedData.firstName || ''}`.trim();
        if (updatedData.avatarUrl) {
          setAvatarUrl(updatedData.avatarUrl);
        }
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
      // Rollback to original store avatar
      setAvatarUrl(user?.avatarUrl || '');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: user?.avatarUrl || '' } : state.user,
      }));
    },
  });

  // Atomic Mutation for removing avatar via DELETE /v1/users/me/avatar
  const { mutate: deleteAvatarMutate, isPending: isDeletingAvatar } = useMutation({
    mutationFn: authApi.deleteAvatar,
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gỡ ảnh đại diện.');
      setAvatarUrl('');
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
      // Rollback to original store avatar
      setAvatarUrl(user?.avatarUrl || '');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatarUrl: user?.avatarUrl || '' } : state.user,
      }));
    },
  });

  const handleAvatarRemove = (_url: string) => {
    // 0ms Optimistic UI removal
    setAvatarUrl('');
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, avatarUrl: null } : state.user,
    }));

    // Atomic API removal
    deleteAvatarMutate();
  };

  const { mutate: uploadBannerMutate, isPending: isUploadingBanner } = useMutation({
    mutationFn: async (file: File) => {
      // Direct Cloudinary Upload via Signed Signature (bypasses app server)
      const uploaded = await fileApi.uploadWithSignature(file, 'banners');

      // Update user account with newly uploaded banner URL & public ID
      const res = await authApi.updateAccountInfo({
        bannerUrl: uploaded.secure_url,
        bannerPublicId: uploaded.public_id,
      });

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || 'Cập nhật ảnh nền thành công!');
      if (res?.data) {
        const updatedData = res.data;
        if (updatedData.bannerUrl) {
          setBannerUrl(updatedData.bannerUrl);
        }
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
      setBannerUrl(user?.bannerUrl || '');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, bannerUrl: user?.bannerUrl || '' } : state.user,
      }));
    },
  });

  const { mutate: deleteBannerMutate, isPending: isDeletingBanner } = useMutation({
    mutationFn: authApi.deleteBanner,
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gỡ ảnh nền.');
      setBannerUrl('');
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
      setBannerUrl(user?.bannerUrl || '');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, bannerUrl: user?.bannerUrl || '' } : state.user,
      }));
    },
  });

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tập tin hình ảnh hợp lệ');
      return;
    }

    // 0ms Optimistic UI preview
    const blobUrl = URL.createObjectURL(file);
    setBannerUrl(blobUrl);
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, bannerUrl: blobUrl } : state.user,
    }));

    uploadBannerMutate(file);

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveBanner = () => {
    // 0ms Optimistic UI removal
    setBannerUrl('');
    useAuthStore.setState((state) => ({
      user: state.user ? { ...state.user, bannerUrl: null } : state.user,
    }));

    deleteBannerMutate();
  };

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
                      onChange={handleAvatarFileSelect}
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
                                value={field.value || ''}
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
        </TabsContent>

        {/* TAB 2: Security & Password (Only for LOCAL auth accounts) */}
        {!isGoogleAccount ? (
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
        ) : null}

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
                  {isDataLoading ? (
                    <Skeleton className="h-5 w-24 rounded-full" />
                  ) : isEmailVerified ? (
                    <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full">
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
                  {isDataLoading ? (
                    <Skeleton className="h-5 w-24 rounded-full" />
                  ) : isPhoneVerified ? (
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

      {/* Facebook-style Avatar Crop & Zoom Modal */}
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
