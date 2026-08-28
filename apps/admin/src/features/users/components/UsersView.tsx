'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Shield, 
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag
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
  ImportButton, 
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
import { UserStatistics } from '../api/user.api';
import { formatDateTimeForFilename } from '@/lib/formatters';
import { useRouter } from 'next/navigation';

interface UsersViewProps {
  initialData?: PageResponse<User>;
  initialStats?: UserStatistics;
}

export default function UsersView({ initialData, initialStats }: UsersViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('staff');

  // React Query fetch số liệu thống kê thực tế từ API Backend (/v1/users/statistics)
  const defaultStats: UserStatistics = { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0, customerUsers: 0 };
  const { data: statsData } = useUserStatistics(initialStats);
  const stats = statsData || initialStats || defaultStats;

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

  const staffRoleParam = staffSearchParams.get('role') as User['role'] | null;
  const staffActiveParam = staffSearchParams.get('active');

  const handleStaffSearch = (val: string) => {
    updateStaffUrl({ name: val, page: 1 });
  };

  const [staffSearchTerm, setStaffSearchTerm] = useDebounceSearch(staffName, handleStaffSearch);

  // Gọi API Backend lấy danh sách nhân sự (roles = SUPER_ADMIN, MANAGER)
  const { 
    data: staffQueryData, 
    isLoading: isStaffLoading, 
    isFetching: isStaffFetching 
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
    isFetching: isCustomerFetching 
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
      },
      {
        onSuccess: () => {
          const roleLabel = ROLE_OPTIONS.find(r => r.value === newRole)?.label || newRole;
          toast.success(`Đã cập nhật vai trò của ${user.fullName} thành ${roleLabel}`);
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
      },
      {
        onSuccess: () => {
          const statusText = newStatus === 'active' ? 'kích hoạt' : 'tạm khóa';
          toast.success(`Đã ${statusText} tài khoản ${user.email}`);
        },
      }
    );
  }, [updateMutation]);

  useHotkeys('+', activeTab === 'staff' ? handleCreateStaffClick : handleCreateCustomerClick);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success(`Xuất file danh sách tài khoản (${formatDateTimeForFilename()}) thành công`);
      setIsExporting(false);
    }, 800);
  }, []);

  const getRoleMeta = (role: User['role']) => ROLE_OPTIONS.find((r) => r.value === role);

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
              {ROLE_OPTIONS.map((opt) => (
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
            disabled={user.role === 'SUPER_ADMIN'}
            title={user.status === 'active' ? 'Đang hoạt động (Bấm để khóa)' : 'Tạm khóa (Bấm để kích hoạt)'}
          />
        </div>
      ),
    },
    {
      header: 'Trạng thái phiên',
      align: 'center',
      className: 'w-[10%] min-w-[100px]',
      headerClassName: 'w-[10%] min-w-[100px]',
      skeleton: <Skeleton className='h-4 w-24 mx-auto' />,
      cell: (user) => (
        <div className='flex items-center justify-center gap-1.5'>
          <div className={cn('h-2 w-2 rounded-full', user.isOnline ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-slate-300')} />
          <span className='text-[11px] font-medium text-slate-500'>
            {user.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
          </span>
        </div>
      ),
    },
    {
      header: 'Ngày tạo',
      align: 'center',
      accessorKey: 'createdAt',
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
          <EditActionButton onClick={() => handleEditClick(user)} disabled={isStaffLoading || isStaffFetching} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} disabled={isStaffLoading || isStaffFetching || user.role === 'SUPER_ADMIN'} />
        </div>
      ),
    },
  ], [handleEditClick, handleQuickRoleChange, handleQuickStatusToggle, handleViewDetail, isStaffFetching, isStaffLoading]);

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
              {ROLE_OPTIONS.map((opt) => (
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
            title={user.status === 'active' ? 'Tài khoản hoạt động (Bấm để khóa)' : 'Đã bị khóa (Bấm để mở khóa)'}
          />
        </div>
      ),
    },
    {
      header: 'Ngày đăng ký',
      align: 'center',
      accessorKey: 'createdAt',
      className: 'text-xs text-slate-500 font-medium',
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (user) => (
        <div className='flex justify-end gap-1'>
          <ViewActionButton onClick={() => handleViewDetail(user)} disabled={isCustomerLoading || isCustomerFetching} />
          <EditActionButton onClick={() => handleEditClick(user)} disabled={isCustomerLoading || isCustomerFetching} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} disabled={isCustomerLoading || isCustomerFetching} />
        </div>
      ),
    },
  ], [handleEditClick, handleQuickRoleChange, handleQuickStatusToggle, handleViewDetail, isCustomerFetching, isCustomerLoading]);

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
    { value: 'fullName,asc', label: 'Tên (A-Z)' },
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
              <ImportButton onClick={() => toast.info('Tính năng nhập file đang phát triển')} disabled={isStaffLoading || isStaffFetching} />
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

      {/* Tabs Container */}
      <Tabs defaultValue="staff" onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 inline-flex gap-2">
          <TabsTrigger 
            value="staff" 
            className="font-bold flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <span>Quản lý nhân sự</span>
            <Badge className="bg-primary/10 text-primary text-[10px] font-extrabold px-1.5 py-0 border-none">
              {stats.managementUsers}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="customers" 
            className="font-bold flex items-center gap-2 px-5 py-2 rounded-lg text-xs transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            <span>Quản lý khách hàng</span>
            <Badge className="bg-amber-100 text-amber-700 text-[10px] font-extrabold px-1.5 py-0 border-none">
              {stats.customerUsers}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: QUẢN LÝ NHÂN SỰ */}
        <TabsContent value="staff" className="space-y-6 mt-0">
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
              (isStaffLoading || staffUsers.length > 0) && (
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
              columns={staffColumns}
              data={staffUsers}
              isLoading={isStaffLoading && !staffUsers.length}
              loadingRows={staffPagination.pageSize}
              emptyState={{
                title: 'Không tìm thấy nhân sự',
                description: 'Không có tài khoản quản trị nào khớp với tìm kiếm.',
              }}
            />
          </DataCard>
        </TabsContent>

        {/* TAB 2: QUẢN LÝ KHÁCH HÀNG */}
        <TabsContent value="customers" className="space-y-6 mt-0">
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
              (isCustomerLoading || customerUsers.length > 0) && (
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
              columns={customerColumns}
              data={customerUsers}
              isLoading={isCustomerLoading && !customerUsers.length}
              loadingRows={customerPagination.pageSize}
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
