'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  Wifi, 
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { 
  PageHeader, 
  DataCard, 
  DataTable, 
  type ColumnDef, 
  Badge, 
  NextPagination, 
  Breadcrumbs
} from '@/components/common';
import { 
  SearchInput, 
  AddNewButton, 
  ExportButton, 
  FilterPopover, 
  SortPopover, 
  ResetFiltersButton,
  ViewActionButton,
  EditActionButton, 
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { User, ROLE_OPTIONS } from '@/features/users/types/user.interface';
import { 
  useUsers, 
  useDeleteUser, 
  useUserStatistics,
  useUpdateUser 
} from '@/features/users/hooks/use-users';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { toast } from 'sonner';
import { PageResponse } from '@/types/pagination';
import { userApi, UserStatistics } from '../api/user.api';
import { getApiErrorMessage, isForbiddenError } from '@/constants/errorMessages';
import { formatDateTimeForFilename } from '@/lib/formatters';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

interface UsersViewProps {
  initialData?: PageResponse<User>;
  initialStats?: UserStatistics;
}

export default function UsersView({ initialData, initialStats }: UsersViewProps): React.JSX.Element {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const isSuperAdmin = [...(currentUser?.roles || []), currentUser?.role || ''].some(role => role.replace(/^ROLE_/, '') === 'SUPER_ADMIN');
  const canEdit = useCallback((user: User): boolean => isSuperAdmin || user.role !== 'SUPER_ADMIN', [isSuperAdmin]);
  const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('staff');

  // React Query fetch số liệu thống kê thực tế từ API Backend (/v1/users/statistics)
  const { data: stats, error: statsError, refetch: refetchStats } = useUserStatistics(initialStats);

  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();

  // ===================== 1. LOGIC NHÂN SỰ (STAFF API: SUPER_ADMIN, MANAGER) =====================
  const {
    page: staffPage,
    size: staffSize,
    sort: staffSort,
    name: staffName,
    updateUrl: updateStaffUrl,
    setPage: setStaffPage,
    setSize: setStaffSize,
    setSort: setStaffSort,
    searchParams: staffSearchParams,
  } = useViewParams('createdAt,desc');

  const staffRoleParam = staffSearchParams.get('role');
  const staffActiveParam = staffSearchParams.get('active');

  const handleStaffSearch = (val: string) => {
    updateStaffUrl({ name: val, page: 1 });
  };

  const [staffSearchTerm, setStaffSearchTerm] = useDebounceSearch(staffName, handleStaffSearch);

  // Gọi API Backend lấy danh sách nhân sự (roles = SUPER_ADMIN, MANAGER)
  const { 
    data: staffQueryData, 
    isLoading: isStaffLoading, 
    isFetching: isStaffFetching,
    error: staffError,
    refetch: refetchStaff,
  } = useUsers(
    {
      page: staffPage,
      size: staffSize,
      sort: staffSort,
      keyword: staffName,
      roles: staffRoleParam ? [staffRoleParam] : ['SUPER_ADMIN', 'MANAGER'],
      active: staffActiveParam === 'true' ? true : staffActiveParam === 'false' ? false : undefined,
    },
    initialData
  );

  const isStaffForbidden = isForbiddenError(staffError);

  const staffUsersData = staffQueryData || initialData;
  const staffUsers = staffUsersData?.data || [];
  const staffPagination = staffUsersData?.pagination || { currentPage: 1, totalPages: 1, totalElements: staffUsers.length, pageSize: 10 };

  // ===================== 2. LOGIC KHÁCH HÀNG (CUSTOMERS API: USER) =====================
  const [customerPage, setCustomerPage] = useState(1);
  const [customerSize, setCustomerSize] = useState(10);
  const [customerSort, setCustomerSort] = useState('createdAt,desc');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerActiveFilter, setCustomerActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const handleCustomerSearch = (val: string) => {
    setCustomerSearch(val);
    setCustomerPage(1);
  };
  const [customerSearchTerm, setCustomerSearchTerm] = useDebounceSearch(customerSearch, handleCustomerSearch);

  // Gọi API Backend lấy danh sách khách hàng (role = USER)
  const { 
    data: customerQueryData, 
    isLoading: isCustomerLoading, 
    isFetching: isCustomerFetching,
    error: customerError,
    refetch: refetchCustomers,
  } = useUsers(
    {
      page: customerPage,
      size: customerSize,
      sort: customerSort,
      keyword: customerSearch,
      role: 'USER',
      active: customerActiveFilter === 'active' ? true : customerActiveFilter === 'inactive' ? false : undefined,
    }
  );

  const isCustomerForbidden = isForbiddenError(customerError);

  const customerUsersData = customerQueryData || { data: [], pagination: { currentPage: 1, totalPages: 1, totalElements: 0, pageSize: 10 } };
  const customerUsers = customerUsersData.data || [];
  const customerPagination = customerUsersData.pagination || { currentPage: 1, totalPages: 1, totalElements: customerUsers.length, pageSize: 10 };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
        },
      });
    }
  }, [deleteConfirmId, deleteMutation]);

  const handleEditClick = useCallback((user: User) => {
    router.push(`/users/${user.id}/edit`);
  }, [router]);

  const handleViewDetail = useCallback((user: User) => {
    router.push(`/users/${user.id}`);
  }, [router]);

  const handleCreateStaffClick = useCallback(() => {
    router.push('/users/create');
  }, [router]);

  const handleCreateCustomerClick = useCallback(() => {
    router.push('/users/create');
  }, [router]);

  const handleQuickRoleChange = useCallback((user: User, newRole: User['role']) => {
    if (user.role === newRole) return;
    updateMutation.mutate(
      {
        id: user.id,
        data: {
          role: newRole,
        },
      }
    );
  }, [updateMutation]);

  const handleQuickStatusToggle = useCallback((user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateMutation.mutate(
      {
        id: user.id,
        data: {
          active: newStatus === 'active',
          status: newStatus,
        },
      }
    );
  }, [updateMutation]);

  useHotkeys('+', activeTab === 'staff' ? handleCreateStaffClick : handleCreateCustomerClick);

  const handleExport = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    try {
      const file = await userApi.export(activeTab === 'staff' ? {
        sort: staffSort, keyword: staffName, roles: staffRoleParam ? [staffRoleParam] : ['SUPER_ADMIN', 'MANAGER'],
        active: staffActiveParam === 'true' ? true : staffActiveParam === 'false' ? false : undefined,
      } : { sort: customerSort, keyword: customerSearch, role: 'USER', active: customerActiveFilter === 'all' ? undefined : customerActiveFilter === 'active' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tai-khoan_${activeTab}_${formatDateTimeForFilename()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Đã xuất danh sách tài khoản');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Không thể xuất danh sách tài khoản'));
    } finally { setIsExporting(false); }
  }, [activeTab, staffSort, staffName, staffRoleParam, staffActiveParam, customerSort, customerSearch, customerActiveFilter]);

  const getRoleMeta = (role: User['role'] | string) => {
    const cleanRole = (role || '').toUpperCase().replace(/^ROLE_/, '').trim();
    return (
      ROLE_OPTIONS.find((r) => r.value === cleanRole) ||
      ROLE_OPTIONS.find((r) => r.value === 'USER')!
    );
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Table Columns Nhân sự
  const staffColumns: ColumnDef<User>[] = useMemo(() => [
    {
      header: 'Nhân sự',
      className: 'w-[26%] min-w-[200px]',
      headerClassName: 'w-[26%] min-w-[200px]',
      skeleton: (
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex flex-col gap-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      ),
      cell: (user) => (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border border-slate-200 shadow-sm shrink-0'>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className='text-sm font-bold text-slate-900 flex items-center gap-1.5'>
              {user.fullName}
              {user.isOnline && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10B981]" title="Trực tuyến" />
              )}
            </p>
            <p className='text-[11px] text-slate-400 font-mono'>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      accessorKey: 'phone',
      className: 'w-[14%] min-w-[110px] text-sm text-slate-600 font-medium font-mono',
      headerClassName: 'w-[14%] min-w-[110px]',
      skeleton: <Skeleton className='h-4 w-24' />,
      cell: (user) => <span className="font-mono text-xs font-medium text-slate-600">{user.phone || '—'}</span>,
    },
    {
      header: 'Vai trò (Gán quyền)',
      className: 'w-[18%] min-w-[140px]',
      headerClassName: 'w-[18%] min-w-[140px]',
      skeleton: <Skeleton className='h-6 w-24 rounded-lg' />,
      cell: (user) => {
        const meta = getRoleMeta(user.role);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                disabled={!canEdit(user) || updateMutation.isPending}
                className="group inline-flex items-center gap-1.5 focus:outline-none"
                title="Bấm để thay đổi vai trò hệ thống"
              >
                <Badge variant='outline' className={cn('text-[10px] font-bold py-1 px-2.5 border-none cursor-pointer group-hover:ring-2 group-hover:ring-primary/20 transition-all flex items-center gap-1', meta?.color)}>
                  <span>{meta?.label || user.role}</span>
                  <ChevronDown size={12} className="opacity-60 group-hover:opacity-100" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white shadow-xl border-slate-200 rounded-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gán vai trò mới
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLE_OPTIONS.filter(opt => isSuperAdmin || opt.value !== 'SUPER_ADMIN').map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleQuickRoleChange(user, opt.value)}
                  className={cn(
                    "cursor-pointer text-xs font-semibold flex items-center justify-between py-2 rounded-lg",
                    user.role === opt.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <span>{opt.label}</span>
                  {user.role === opt.value && <CheckCircle2 size={14} className="text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      header: 'Trạng thái tài khoản',
      align: 'center',
      className: 'w-[14%] min-w-[120px]',
      headerClassName: 'w-[14%] min-w-[120px]',
      skeleton: <Skeleton className='h-6 w-20 mx-auto rounded-full' />,
      cell: (user) => (
        <div className="flex items-center justify-center">
          <Switch
            checked={user.status === 'active'}
            onCheckedChange={() => handleQuickStatusToggle(user)}
            disabled={!canEdit(user) || currentUser?.id === user.id || updateMutation.isPending}
            title={user.status === 'active' ? 'Đang hoạt động (Bấm để khóa)' : 'Tạm khóa (Bấm để kích hoạt)'}
          />
        </div>
      ),
    },
    {
      header: 'Ngày tạo',
      align: 'center',
      accessorKey: 'createdAt',
      cell: user => <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>,
      className: 'w-[10%] min-w-[90px] text-xs text-slate-500 font-medium',
      headerClassName: 'w-[10%] min-w-[90px]',
      skeleton: <Skeleton className='h-4 w-20 mx-auto' />,
    },
    {
      header: 'Thao tác',
      align: 'right',
      className: 'w-[8%] min-w-[90px]',
      headerClassName: 'w-[8%] min-w-[90px]',
      skeleton: <Skeleton className='h-8 w-24 ml-auto rounded-lg' />,
      cell: (user) => (
        <div className='flex justify-end gap-1'>
          <ViewActionButton onClick={() => handleViewDetail(user)} disabled={isStaffLoading || isStaffFetching} />
          <EditActionButton onClick={() => handleEditClick(user)} disabled={isStaffLoading || isStaffFetching || !canEdit(user)} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} disabled={isStaffLoading || isStaffFetching || !canEdit(user) || currentUser?.id === user.id || deleteMutation.isPending} />
        </div>
      ),
    },
  ], [canEdit, currentUser?.id, deleteMutation.isPending, isSuperAdmin, updateMutation.isPending, handleEditClick, handleQuickRoleChange, handleQuickStatusToggle, handleViewDetail, isStaffFetching, isStaffLoading]);

  // Table Columns Khách hàng
  const customerColumns: ColumnDef<User>[] = useMemo(() => [
    {
      header: 'Khách hàng',
      skeleton: (
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex flex-col gap-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
      ),
      cell: (user) => (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border border-slate-200 shadow-sm shrink-0'>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className='bg-amber-100 text-amber-700 text-xs font-bold'>
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className='text-sm font-bold text-slate-900'>{user.fullName}</p>
            <p className='text-[11px] text-slate-400 font-mono'>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      accessorKey: 'phone',
      className: 'text-sm text-slate-600 font-mono',
      skeleton: <Skeleton className='h-4 w-24' />,
      cell: (user) => <span className="font-mono text-xs font-medium text-slate-600">{user.phone || '—'}</span>,
    },
    {
      header: 'Vai trò (Gán quyền)',
      cell: (user) => {
        const meta = getRoleMeta(user.role);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                disabled={!canEdit(user) || updateMutation.isPending}
                className="group inline-flex items-center gap-1.5 focus:outline-none"
                title="Gán vai trò quản trị cho khách hàng này"
              >
                <Badge variant='outline' className={cn('text-[10px] font-bold py-1 px-2.5 border-none cursor-pointer group-hover:ring-2 group-hover:ring-primary/20 transition-all flex items-center gap-1', meta?.color)}>
                  <span>{meta?.label || user.role}</span>
                  <ChevronDown size={12} className="opacity-60 group-hover:opacity-100" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white shadow-xl border-slate-200 rounded-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Nâng cấp vai trò
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLE_OPTIONS.filter(opt => isSuperAdmin || opt.value !== 'SUPER_ADMIN').map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleQuickRoleChange(user, opt.value)}
                  className={cn(
                    "cursor-pointer text-xs font-semibold flex items-center justify-between py-2 rounded-lg",
                    user.role === opt.value ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <span>{opt.label}</span>
                  {user.role === opt.value && <CheckCircle2 size={14} className="text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      header: 'Trạng thái mua hàng',
      align: 'center',
      cell: (user) => (
        <div className="flex items-center justify-center">
          <Switch
            checked={user.status === 'active'}
            onCheckedChange={() => handleQuickStatusToggle(user)}
            disabled={!canEdit(user) || currentUser?.id === user.id || updateMutation.isPending}
            title={user.status === 'active' ? 'Tài khoản hoạt động (Bấm để khóa)' : 'Đã bị khóa (Bấm để mở khóa)'}
          />
        </div>
      ),
    },
    {
      header: 'Ngày đăng ký',
      align: 'center',
      accessorKey: 'createdAt',
      cell: user => <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>,
      className: 'text-xs text-slate-500 font-medium',
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (user) => (
        <div className='flex justify-end gap-1'>
          <ViewActionButton onClick={() => handleViewDetail(user)} disabled={isCustomerLoading || isCustomerFetching} />
          <EditActionButton onClick={() => handleEditClick(user)} disabled={isCustomerLoading || isCustomerFetching || !canEdit(user)} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} disabled={isCustomerLoading || isCustomerFetching || !canEdit(user) || currentUser?.id === user.id || deleteMutation.isPending} />
        </div>
      ),
    },
  ], [canEdit, currentUser?.id, deleteMutation.isPending, isSuperAdmin, updateMutation.isPending, handleEditClick, handleQuickRoleChange, handleQuickStatusToggle, handleViewDetail, isCustomerFetching, isCustomerLoading]);

  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-medium text-xs px-3 py-2 rounded-lg text-left transition-all flex items-center w-full',
      active
        ? 'bg-primary/10 text-primary font-bold'
        : 'bg-transparent hover:bg-slate-50 text-slate-600',
    );

  const sortOptions = [
    { value: 'createdAt,desc', label: 'Mới nhất' },
    { value: 'createdAt,asc', label: 'Cũ nhất' },
    { value: 'profile.firstName,asc', label: 'Tên (A-Z)' },
    { value: 'email,asc', label: 'Email (A-Z)' },
  ];

  const breadcrumbItems = [
    { label: 'Tài khoản & Phân quyền' },
  ];

  const activeStaffFiltersCount = (staffRoleParam ? 1 : 0) + (staffActiveParam ? 1 : 0);

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      
      <PageHeader
        title='Quản lý người dùng'
        description='Quản lý phân quyền tài khoản nhân sự hệ thống và theo dõi tài khoản khách hàng.'
        actions={
          activeTab === 'staff' ? (
            <>
              <ExportButton onExport={handleExport} isLoading={isExporting} disabled={isStaffLoading || isStaffFetching} />
              <AddNewButton onClick={handleCreateStaffClick} disabled={isStaffLoading || isStaffFetching} />
            </>
          ) : (
            <>
              <ExportButton onExport={handleExport} isLoading={isExporting} disabled={isCustomerLoading || isCustomerFetching} />
              <AddNewButton onClick={handleCreateCustomerClick} disabled={isCustomerLoading || isCustomerFetching} />
            </>
          )
        }
      />

      {statsError && <div role="alert" className="rounded-xl border border-red-200 p-4 text-sm text-red-700">{getApiErrorMessage(statsError, 'Không thể tải thống kê')} <Button variant="outline" onClick={() => void refetchStats()}>Thử lại</Button></div>}
      {/* Statistics Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tổng tài khoản</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">{stats?.totalUsers ?? '—'}</p>
          <p className="text-[11px] text-slate-400 font-medium">
            {stats?.customerUsers ?? '—'} khách hàng • {stats?.managementUsers ?? '—'} nhân sự
          </p>
        </div>

        {/* Online Users Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Đang trực tuyến</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 relative">
              <Wifi className="w-4 h-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10B981]" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700 font-mono">{stats?.onlineUsers ?? '—'}</p>
          <p className="text-[11px] text-slate-400 font-medium">
            Cập nhật mỗi 30 giây ({stats?.offlineUsers ?? '—'} ngoại tuyến)
          </p>
        </div>

        {/* Management Staff Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Nhân sự Quản trị</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-purple-700 font-mono">{stats?.managementUsers ?? '—'}</p>
          <p className="text-[11px] text-slate-400 font-medium">
            Admin & Quản lý vận hành
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="staff" onValueChange={(val) => { if (val === 'staff' || val === 'customers') { setActiveTab(val); } }} className="space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 inline-flex gap-2">
          <TabsTrigger 
            value="staff" 
            className="font-bold flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <span>Quản lý nhân sự</span>
            <Badge className="bg-primary/10 text-primary text-[10px] font-extrabold px-1.5 py-0 border-none">
              {stats?.managementUsers ?? '—'}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="font-bold flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <span>Quản lý khách hàng</span>
            <Badge className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0 border-none">
              {stats?.customerUsers ?? '—'}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: QUẢN LÝ NHÂN SỰ */}
        <TabsContent value="staff" className="space-y-6 mt-0">
          {staffError && <div role="alert" className="rounded-xl border border-red-200 p-4 text-sm text-red-700">{getApiErrorMessage(staffError, 'Không thể tải nhân sự')} <Button variant="outline" onClick={() => void refetchStaff()}>Thử lại</Button></div>}
          <DataCard
            isLoading={isStaffLoading}
            isFetching={isStaffFetching}
            search={
              <SearchInput 
                value={staffSearchTerm} 
                onChange={setStaffSearchTerm} 
                placeholder='Tìm kiếm nhân sự theo tên, email, SĐT...' 
                isLoading={isStaffLoading || isStaffFetching}
              />
            }
            extra={
              <>
                <FilterPopover 
                  activeCount={activeStaffFiltersCount} 
                  onClear={() => updateStaffUrl({ role: '', active: '', page: 1 })}
                  disabled={isStaffLoading || isStaffFetching}
                >
                  <div className='space-y-4 p-1 w-56 text-left'>
                    <div className='space-y-2'>
                      <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                        Trạng thái
                      </h4>
                      <div className='flex flex-col gap-0.5'>
                        <button
                          className={filterBtnClass(!staffActiveParam)}
                          onClick={() => updateStaffUrl({ active: '', page: 1 })}>
                          Tất cả trạng thái
                        </button>
                        <button
                          className={filterBtnClass(staffActiveParam === 'true')}
                          onClick={() => updateStaffUrl({ active: 'true', page: 1 })}>
                          Hoạt động
                        </button>
                        <button
                          className={filterBtnClass(staffActiveParam === 'false')}
                          onClick={() => updateStaffUrl({ active: 'false', page: 1 })}>
                          Tạm khóa
                        </button>
                      </div>
                    </div>

                    <div className='space-y-2 pt-2 border-t border-slate-100'>
                      <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                        Vai trò (Role)
                      </h4>
                      <div className='flex flex-col gap-0.5'>
                        <button
                          className={filterBtnClass(!staffRoleParam)}
                          onClick={() => updateStaffUrl({ role: '', page: 1 })}>
                          Tất cả vai trò nhân sự
                        </button>
                        <button
                          className={filterBtnClass(staffRoleParam === 'SUPER_ADMIN')}
                          onClick={() => updateStaffUrl({ role: 'SUPER_ADMIN', page: 1 })}>
                          Quản trị viên (Super Admin)
                        </button>
                        <button
                          className={filterBtnClass(staffRoleParam === 'MANAGER')}
                          onClick={() => updateStaffUrl({ role: 'MANAGER', page: 1 })}>
                          Quản lý (Manager)
                        </button>
                      </div>
                    </div>

                    {activeStaffFiltersCount > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <ResetFiltersButton onClick={() => updateStaffUrl({ role: '', active: '', page: 1 })} />
                      </div>
                    )}
                  </div>
                </FilterPopover>

                <SortPopover
                  options={sortOptions}
                  currentValue={staffSort}
                  onSelect={setStaffSort}
                  disabled={isStaffLoading || isStaffFetching}
                />
              </>
            }
            footer={
              !isStaffForbidden && (isStaffLoading || staffUsers.length > 0) && (
                <NextPagination
                  isLoading={isStaffLoading}
                  currentPage={staffPagination.currentPage}
                  totalPages={staffPagination.totalPages}
                  totalItems={staffPagination.totalElements}
                  itemsPerPage={staffPagination.pageSize}
                  onItemsPerPageChange={setStaffSize}
                  onPageChange={setStaffPage}
                />
              )
            }
          >
            <DataTable
          auditTrail
          recoveryModule="users"
              columns={staffColumns}
              data={staffUsers}
              isLoading={isStaffLoading && !staffUsers.length}
              loadingRows={staffPagination.pageSize}
              isForbidden={isStaffForbidden}
              forbiddenState={{
                title: 'Không có quyền xem nhân sự',
                description: 'Tài khoản của bạn chưa được cấp quyền xem danh sách nhân sự (user:read). Vui lòng liên hệ Quản trị viên để được phân quyền.',
              }}
              emptyState={{
                title: 'Không tìm thấy nhân sự',
                description: 'Không có tài khoản quản trị nào khớp với tìm kiếm.',
              }}
            />
          </DataCard>
        </TabsContent>

        {/* TAB 2: QUẢN LÝ KHÁCH HÀNG */}
        <TabsContent value="customers" className="space-y-6 mt-0">
          {customerError && <div role="alert" className="rounded-xl border border-red-200 p-4 text-sm text-red-700">{getApiErrorMessage(customerError, 'Không thể tải khách hàng')} <Button variant="outline" onClick={() => void refetchCustomers()}>Thử lại</Button></div>}
          <DataCard
            isLoading={isCustomerLoading}
            isFetching={isCustomerFetching}
            search={
              <SearchInput 
                value={customerSearchTerm} 
                onChange={setCustomerSearchTerm} 
                placeholder='Tìm kiếm khách hàng theo tên, email, SĐT...' 
                isLoading={isCustomerLoading || isCustomerFetching}
              />
            }
            extra={
              <>
                <FilterPopover 
                  activeCount={customerActiveFilter !== 'all' ? 1 : 0} 
                  onClear={() => setCustomerActiveFilter('all')}
                  disabled={isCustomerLoading || isCustomerFetching}
                >
                  <div className='space-y-2 p-1 w-48 text-left'>
                    <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                      Trạng thái tài khoản
                    </h4>
                    <div className='flex flex-col gap-0.5'>
                      <button
                        className={filterBtnClass(customerActiveFilter === 'all')}
                        onClick={() => setCustomerActiveFilter('all')}>
                        Tất cả trạng thái
                      </button>
                      <button
                        className={filterBtnClass(customerActiveFilter === 'active')}
                        onClick={() => setCustomerActiveFilter('active')}>
                        Hoạt động
                      </button>
                      <button
                        className={filterBtnClass(customerActiveFilter === 'inactive')}
                        onClick={() => setCustomerActiveFilter('inactive')}>
                        Đã khóa
                      </button>
                    </div>
                  </div>
                </FilterPopover>

                <SortPopover
                  options={sortOptions}
                  currentValue={customerSort}
                  onSelect={setCustomerSort}
                  disabled={isCustomerLoading || isCustomerFetching}
                />
              </>
            }
            footer={
              !isCustomerForbidden && (isCustomerLoading || customerUsers.length > 0) && (
                <NextPagination
                  isLoading={isCustomerLoading}
                  currentPage={customerPagination.currentPage}
                  totalPages={customerPagination.totalPages}
                  totalItems={customerPagination.totalElements}
                  itemsPerPage={customerPagination.pageSize}
                  onItemsPerPageChange={setCustomerSize}
                  onPageChange={setCustomerPage}
                />
              )
            }
          >
            <DataTable
          auditTrail
          recoveryModule="users"
              columns={customerColumns}
              data={customerUsers}
              isLoading={isCustomerLoading && !customerUsers.length}
              loadingRows={customerPagination.pageSize}
              isForbidden={isCustomerForbidden}
              forbiddenState={{
                title: 'Không có quyền xem khách hàng',
                description: 'Tài khoản của bạn chưa được cấp quyền xem danh sách khách hàng. Vui lòng liên hệ Quản trị viên để được phân quyền.',
              }}
              emptyState={{
                title: 'Không tìm thấy khách hàng',
                description: 'Chưa có tài khoản khách hàng nào khớp với tìm kiếm.',
              }}
            />
          </DataCard>
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
