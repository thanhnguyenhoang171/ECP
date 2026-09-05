'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Edit, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown,
  Shield,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { useUser, useUpdateUser } from '../hooks/use-users';
import { ROLE_OPTIONS, User } from '../types/user.interface';
import { Breadcrumbs, PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

interface UserDetailViewProps {
  id: string;
}

export function UserDetailView({ id }: UserDetailViewProps): React.JSX.Element {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser(id);
  const updateMutation = useUpdateUser();

  const isLoadingData = isLoading && !user;

  const roleMeta = user ? ROLE_OPTIONS.find((r) => r.value === user.role) : null;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleQuickRoleChange = useCallback((newRole: User['role']) => {
    if (!user || user.role === newRole) return;
    updateMutation.mutate(
      {
        id: user.id,
        data: { role: newRole },
      },
      {
        onSuccess: () => {
          const roleLabel = ROLE_OPTIONS.find((r) => r.value === newRole)?.label || newRole;
          toast.success(`Đã cập nhật vai trò của ${user.fullName} thành ${roleLabel}`);
        },
      }
    );
  }, [user, updateMutation]);

  const handleQuickStatusToggle = useCallback(() => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate(
      {
        id: user.id,
        data: {
          active: newStatus === 'active',
          status: newStatus,
        },
      },
      {
        onSuccess: () => {
          const statusText = newStatus === 'active' ? 'kích hoạt' : 'tạm khóa';
          toast.success(`Đã ${statusText} tài khoản ${user.email}`);
        },
      }
    );
  }, [user, updateMutation]);

  const breadcrumbItems = [
    { label: 'Tài khoản & Phân quyền', href: '/users', icon: Users },
    { label: user ? user.fullName : 'Chi tiết tài khoản' },
  ];

  if (isError || (!isLoading && !user)) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl space-y-4">
          <Users className="w-16 h-16 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy người dùng</h2>
          <p className="text-xs text-slate-500">Tài khoản này có thể đã bị xóa hoặc không tồn tại trong hệ thống.</p>
          <Button onClick={() => router.push('/users')} variant="outline" className="gap-2 font-bold text-xs rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách người dùng
          </Button>
        </div>
      </div>
    );
  }

  // Permission details text according to assigned role
  const getRolePermissionSummary = (role?: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          title: 'Quản trị viên hệ thống (Super Admin)',
          description: 'Toàn quyền truy cập và quản trị toàn bộ hệ thống ECP (Quản lý người dùng, gán quyền, quản lý sản phẩm, đơn hàng, kho và cài đặt hệ thống).',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          scopeList: [
            'Quản lý danh sách người dùng & Phân quyền hệ thống',
            'Toàn quyền tạo, sửa, xóa sản phẩm, thương hiệu, danh mục',
            'Quản lý kho hàng, nhập/xóa kiểm kê và sổ nhật ký kho',
            'Truy xuất lịch sử audit log và cấu hình bảo mật',
          ],
        };
      case 'MANAGER':
        return {
          title: 'Quản lý nghiệp vụ (Manager)',
          description: 'Quyền quản lý danh mục sản phẩm, kho hàng, nhập hàng và theo dõi tài khoản khách hàng.',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          scopeList: [
            'Quản lý sản phẩm, danh mục, thương hiệu và nhà cung cấp',
            'Quản lý đơn hàng mua, phiếu nhập kho và kiểm kê kho',
            'Xem danh sách khách hàng và quản lý tài khoản người dùng',
          ],
        };
      case 'USER':
      default:
        return {
          title: 'Khách hàng (User)',
          description: 'Tài khoản người dùng/khách hàng mua sắm trên gian hàng thương mại điện tử.',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          scopeList: [
            'Đăng nhập và mua sắm trên cửa hàng trực tuyến',
            'Theo dõi lịch sử đơn hàng và cập nhật thông tin cá nhân',
          ],
        };
    }
  };

  const permSummary = getRolePermissionSummary(user?.role);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50 duration-300">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={user?.fullName || 'Chi tiết tài khoản'}
        description={user ? `Tài khoản: ${user.email}` : 'Thông tin chi tiết cá nhân và phân quyền tài khoản'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/users')}
              className="gap-1.5 text-xs font-bold border-slate-300 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Danh sách
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/users/${id}/edit`)}
              disabled={isLoadingData}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-4"
            >
              <Edit className="w-4 h-4" /> Chỉnh sửa
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar Profile & Role Assignment (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main User Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5 text-center flex flex-col items-center">
            {isLoadingData ? (
              <Skeleton className="h-28 w-28 rounded-full" />
            ) : (
              <Avatar className="h-28 w-28 border-4 border-white shadow-md ring-1 ring-slate-200 overflow-hidden">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-2xl">
                  {getInitials(user?.fullName || '')}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="space-y-1 w-full text-center">
              {isLoadingData ? (
                <Skeleton className="h-6 w-36 mx-auto rounded-md" />
              ) : (
                <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5">
                  {user?.fullName}
                  {user?.isOnline && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" title="Đang trực tuyến" />
                  )}
                </h3>
              )}

              {isLoadingData ? (
                <Skeleton className="h-4 w-48 mx-auto rounded-md mt-1" />
              ) : (
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
              )}
            </div>

            {/* Quick Role Dropdown Assignment */}
            <div className="w-full pt-2 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Vai trò & Gán quyền:
                </span>

                {isLoadingData ? (
                  <Skeleton className="h-6 w-24 rounded-lg" />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group inline-flex items-center gap-1 focus:outline-none"
                        title="Bấm để gán vai trò mới"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-bold py-1 px-3 border-none cursor-pointer group-hover:ring-2 group-hover:ring-blue-200 transition-all flex items-center gap-1',
                            roleMeta?.color || 'bg-slate-100 text-slate-700'
                          )}
                        >
                          <span>{roleMeta?.label || user?.role}</span>
                          <ChevronDown size={13} className="opacity-60 group-hover:opacity-100" />
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white shadow-xl border-slate-200 rounded-xl">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Thay đổi vai trò người dùng
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ROLE_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => handleQuickRoleChange(opt.value)}
                          className={cn(
                            'cursor-pointer text-xs font-semibold flex items-center justify-between py-2 rounded-lg',
                            user?.role === opt.value ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <span>{opt.label}</span>
                          {user?.role === opt.value && <CheckCircle2 size={14} className="text-blue-600" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Status Toggle Switch */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-700 font-semibold">Trạng thái tài khoản</span>
                {isLoadingData ? (
                  <Skeleton className="h-6 w-11 rounded-full" />
                ) : (
                  <Switch
                    checked={user?.status === 'active'}
                    onCheckedChange={handleQuickStatusToggle}
                    disabled={user?.role === 'SUPER_ADMIN'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Personal Info & Permissions Overview (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Thông tin cá nhân & Liên hệ */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" /> Thông tin cá nhân & Liên hệ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Họ và tên
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-40 rounded-md" />
                ) : (
                  <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email đăng nhập
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-48 rounded-md" />
                ) : (
                  <p className="text-xs font-mono font-semibold text-slate-800">{user?.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-36 rounded-md" />
                ) : (
                  <p className="text-xs font-mono font-semibold text-slate-800">
                    {user?.phone || 'Chưa cập nhật số điện thoại'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Mã ID tài khoản
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-5 w-36 rounded-md" />
                ) : (
                  <p className="text-xs font-mono text-slate-600">{user?.id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Quyền hạn & Phạm vi truy cập */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" /> Phạm vi phân quyền hệ thống
            </h2>

            {isLoadingData ? (
              <Skeleton className="h-28 w-full rounded-xl" />
            ) : (
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{permSummary.title}</span>
                  <Badge variant="outline" className={cn('text-[10px] font-bold border-none', permSummary.badgeColor)}>
                    {roleMeta?.label || user?.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{permSummary.description}</p>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Quyền hạn cụ thể:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {permSummary.scopeList.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Nhật ký & Thông tin hệ thống */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Nhật ký hệ thống & Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày tạo tài khoản
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-4 w-28 rounded-md" />
                ) : (
                  <p className="font-semibold text-slate-800">{user?.createdAt ? formatDate(user.createdAt) : '---'}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Ngày cập nhật gần nhất
                </span>
                {isLoadingData ? (
                  <Skeleton className="h-4 w-28 rounded-md" />
                ) : (
                  <p className="font-semibold text-slate-800">{user?.updatedAt ? formatDate(user.updatedAt) : '---'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
