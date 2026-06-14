'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Shield, 
  KeyRound, 
  ShieldCheck, 
  Edit2, 
  UserPlus 
} from 'lucide-react';
import { 
  PageHeader, 
  DataCard, 
  DataTable, 
  type ColumnDef, 
  Badge, 
  Card, 
  CardContent, 
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
  EditActionButton, 
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, ROLE_OPTIONS } from '@/features/users/types/user.interface';
import { 
  useUsers, 
  useDeleteUser, 
  useUserStatistics 
} from '@/features/users/hooks/use-users';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { toast } from 'sonner';
import { PageResponse } from '@/types/pagination';
import { UserStatistics } from '../api/user.api';

// Dialog & Switch UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import UserForm from './UserForm';

interface UsersViewProps {
  initialData: PageResponse<User>;
  initialStats: UserStatistics;
}

// RBAC Permissions structure
interface Permission {
  key: string;
  name: string;
  description: string;
  group: 'catalog' | 'inventory' | 'sales' | 'system';
}

const permissionGroups = {
  catalog: 'Sản phẩm & Danh mục',
  inventory: 'Kho hàng & Logistics',
  sales: 'Bán hàng & Doanh thu',
  system: 'Cấu hình hệ thống',
};

const permissionsList: Permission[] = [
  { key: 'catalog.view', name: 'Xem sản phẩm & danh mục', description: 'Xem danh sách sản phẩm, SKU và danh mục sản phẩm.', group: 'catalog' },
  { key: 'catalog.create_edit', name: 'Thêm mới / Sửa sản phẩm', description: 'Tạo sản phẩm mới, thiết lập biến thể và cập nhật thông tin.', group: 'catalog' },
  { key: 'catalog.delete', name: 'Xóa sản phẩm & danh mục', description: 'Xóa vĩnh viễn sản phẩm hoặc danh mục khỏi hệ thống.', group: 'catalog' },
  
  { key: 'inventory.view', name: 'Xem thông tin tồn kho', description: 'Theo dõi lượng tồn kho và xem sổ cái kho.', group: 'inventory' },
  { key: 'inventory.adjust', name: 'Điều chỉnh tồn kho nhanh', description: 'Thay đổi trực tiếp số lượng tồn kho của biến thể.', group: 'inventory' },
  { key: 'inventory.goods_receipt', name: 'Tạo đơn nhập kho', description: 'Tạo phiếu nhập hàng và xác nhận nhập kho.', group: 'inventory' },
  { key: 'inventory.manage_setup', name: 'Quản lý kho & Nhà cung cấp', description: 'Thêm mới/Chỉnh sửa thông tin kho bãi và nhà cung cấp.', group: 'inventory' },
  
  { key: 'sales.view_orders', name: 'Xem danh sách đơn hàng', description: 'Xem chi tiết thông tin đơn hàng và giao dịch thanh toán.', group: 'sales' },
  { key: 'sales.update_order_status', name: 'Cập nhật trạng thái đơn hàng', description: 'Xác nhận đơn hàng, giao hàng và hoàn thành đơn hàng.', group: 'sales' },
  { key: 'sales.refund', name: 'Hoàn tiền giao dịch', description: 'Xác nhận và hoàn tiền cho các giao dịch bị lỗi hoặc hủy đơn.', group: 'sales' },
  { key: 'sales.view_customers', name: 'Xem thông tin khách hàng', description: 'Xem dữ liệu chi tiêu LTV và thăng hạng thành viên.', group: 'sales' },
  
  { key: 'system.manage_users', name: 'Quản lý nhân viên', description: 'Tạo mới, khóa hoặc cập nhật tài khoản nhân sự.', group: 'system' },
  { key: 'system.view_audit_logs', name: 'Xem nhật ký kiểm toán', description: 'Theo dõi lịch sử truy vết hành động của các tài khoản (chỉ dành cho Super Admin).', group: 'system' },
  { key: 'system.settings', name: 'Cài đặt hệ thống', description: 'Thay đổi các tham số cấu hình chung của ứng dụng.', group: 'system' },
];

const initialRolePermissions: Record<string, Record<User['role'], boolean>> = {
  'catalog.view': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  'catalog.create_edit': { SUPER_ADMIN: true, MANAGER: true, USER: false },
  'catalog.delete': { SUPER_ADMIN: true, MANAGER: false, USER: false },
  
  'inventory.view': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  'inventory.adjust': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  'inventory.goods_receipt': { SUPER_ADMIN: true, MANAGER: true, USER: false },
  'inventory.manage_setup': { SUPER_ADMIN: true, MANAGER: true, USER: false },
  
  'sales.view_orders': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  'sales.update_order_status': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  'sales.refund': { SUPER_ADMIN: true, MANAGER: true, USER: false },
  'sales.view_customers': { SUPER_ADMIN: true, MANAGER: true, USER: true },
  
  'system.manage_users': { SUPER_ADMIN: true, MANAGER: false, USER: false },
  'system.view_audit_logs': { SUPER_ADMIN: true, MANAGER: false, USER: false },
  'system.settings': { SUPER_ADMIN: true, MANAGER: false, USER: false },
};

export default function UsersView({ initialData, initialStats }: UsersViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  
  const {
    page,
    size,
    sort,
    name,
    updateUrl,
    setPage,
    setSize,
    setSort,
    searchParams,
  } = useViewParams('createdAt,desc');

  const roleParam = searchParams.get('role') as User['role'] | null;
  const activeParam = searchParams.get('active');

  // React Query fetch danh sách users
  const { data, isLoading, isFetching } = useUsers(
    {
      page,
      size,
      sort,
      keyword: name,
      role: roleParam || undefined,
      active: activeParam === 'true' ? true : activeParam === 'false' ? false : undefined,
    },
    initialData
  );

  // React Query fetch số liệu thống kê (MySQL + Redis)
  const { data: statsData } = useUserStatistics(initialStats);
  const stats = statsData || initialStats;

  const deleteMutation = useDeleteUser();

  // States quản lý Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSearch = (val: string) => {
    updateUrl({ name: val, page: 1 });
  };

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, handleSearch);

  const usersData = data || initialData;
  const users = usersData.data || [];
  const pagination = usersData.pagination;

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
        },
      });
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };


  const getRoleMeta = (role: User['role']) => ROLE_OPTIONS.find((r) => r.value === role);

  const columns: ColumnDef<User>[] = [
    {
      header: 'Người dùng',
      cell: (user) => (
        <div className='flex items-center gap-3'>
          <Avatar className='h-9 w-9 border border-slate-200'>
            <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
              {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className='text-sm font-bold text-slate-900 flex items-center gap-1.5'>
              {user.fullName}
              {user.isOnline && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Trực tuyến" />
              )}
            </p>
            <p className='text-[11px] text-slate-400 font-mono'>{user.email} • @{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      accessorKey: 'phone',
      className: 'text-sm text-slate-600 font-medium',
    },
    {
      header: 'Vai trò',
      cell: (user) => {
        const meta = getRoleMeta(user.role);
        return (
          <Badge variant='outline' className={cn('text-[10px] font-bold py-0.5 px-2 border-none', meta?.color)}>
            {meta?.label || user.role}
          </Badge>
        );
      },
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (user) => {
        const variant = user.status === 'active' ? 'default' : 'secondary';
        const label = user.status === 'active' ? 'Hoạt động' : 'Tạm khóa';
        return (
          <Badge 
            variant={variant} 
            className={cn(
              'text-[10px] font-bold py-0.5 px-2 border-none uppercase',
              user.status === 'active' 
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-50'
            )}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      header: 'Trạng thái phiên',
      align: 'center',
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
      className: 'text-xs text-slate-500 font-medium',
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (user) => (
        <div className='flex justify-end gap-1'>
          <EditActionButton onClick={() => handleEditClick(user)} disabled={isLoading || isFetching} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} disabled={isLoading || isFetching || user.role === 'SUPER_ADMIN'} />
        </div>
      ),
    },
  ];

  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-medium text-xs px-3 py-2 rounded-lg text-left transition-all flex items-center w-full',
      active
        ? 'bg-primary/10 text-primary'
        : 'bg-transparent hover:bg-slate-50 text-slate-500',
    );

  const sortOptions = [
    { value: 'createdAt,desc', label: 'Ngày tạo (Mới nhất)' },
    { value: 'createdAt,asc', label: 'Ngày tạo (Cũ nhất)' },
    { value: 'username,asc', label: 'Tài khoản (A-Z)' },
    { value: 'username,desc', label: 'Tài khoản (Z-A)' },
    { value: 'email,asc', label: 'Email (A-Z)' },
  ];

  const breadcrumbItems = [
    { label: 'Nhân viên', icon: Users },
  ];

  // Phân chia danh sách quyền hạn theo nhóm
  const groupedPermissions = useMemo(() => {
    const groups: Record<Permission['group'], Permission[]> = {
      catalog: [],
      inventory: [],
      sales: [],
      system: [],
    };
    permissionsList.forEach(p => {
      groups[p.group].push(p);
    });
    return groups;
  }, []);

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Tabs Switch */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-px">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "pb-3 text-sm font-bold transition-all relative",
              activeTab === 'users' 
                ? "text-primary border-b-2 border-primary" 
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              Tài khoản nhân viên
            </span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={cn(
              "pb-3 text-sm font-bold transition-all relative",
              activeTab === 'permissions' 
                ? "text-primary border-b-2 border-primary" 
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-2">
              <KeyRound size={16} />
              Vai trò & Quyền hạn (RBAC)
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <PageHeader
            title='Quản lý nhân viên'
            description='Quản lý tài khoản và giám sát trạng thái hoạt động của nhân sự.'
            actions={
              <>
                <ImportButton onClick={() => toast.info('Tính năng đang được phát triển')} disabled={isLoading || isFetching} />
                <ExportButton onExport={() => toast.info('Tính năng đang được phát triển')} isLoading={false} disabled={isLoading || isFetching} />
                <AddNewButton onClick={handleCreateClick} disabled={isLoading || isFetching} />
              </>
            }
          />

          {/* Stats Grid */}
          <div className='grid gap-4 md:grid-cols-4'>
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='p-2.5 rounded-xl bg-blue-50 text-blue-600'>
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Tổng người dùng</p>
                  <p className='text-2xl font-black text-slate-900'>{stats.totalUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600'>
                  <Wifi size={20} />
                </div>
                <div className="text-left">
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Đang trực tuyến</p>
                  <p className='text-2xl font-black text-slate-900'>{stats.onlineUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='p-2.5 rounded-xl bg-slate-50 text-slate-600'>
                  <WifiOff size={20} />
                </div>
                <div className="text-left">
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Ngoại tuyến</p>
                  <p className='text-2xl font-black text-slate-900'>{stats.offlineUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className='flex items-center gap-3 pt-6'>
                <div className='p-2.5 rounded-xl bg-purple-50 text-purple-600'>
                  <Shield size={20} />
                </div>
                <div className="text-left">
                  <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Admin / Quản lý</p>
                  <p className='text-2xl font-black text-slate-900'>{stats.managementUsers}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Area */}
          <DataCard
            isLoading={isLoading}
            isFetching={isFetching}
            search={
              <SearchInput 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder='Tìm kiếm nhân viên...' 
                isLoading={isLoading || isFetching}
              />
            }
            extra={
              <>
                <FilterPopover 
                  activeCount={(roleParam ? 1 : 0) + (activeParam ? 1 : 0)} 
                  onClear={() => updateUrl({ role: '', active: '', page: 1 })}
                  disabled={isLoading || isFetching}
                >
                  <div className='space-y-4 p-1 w-52 text-left'>
                    <div className='space-y-2'>
                      <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                        Trạng thái
                      </h4>
                      <div className='flex flex-col gap-0.5'>
                        <button
                          className={filterBtnClass(!activeParam)}
                          onClick={() => updateUrl({ active: '', page: 1 })}>
                          Tất cả trạng thái
                        </button>
                        <button
                          className={filterBtnClass(activeParam === 'true')}
                          onClick={() => updateUrl({ active: 'true', page: 1 })}>
                          <div className='mr-2 h-2 w-2 rounded-full bg-green-500' />{' '}
                          Hoạt động
                        </button>
                        <button
                          className={filterBtnClass(activeParam === 'false')}
                          onClick={() => updateUrl({ active: 'false', page: 1 })}>
                          <div className='mr-2 h-2 w-2 rounded-full bg-red-500' />{' '}
                          Không hoạt động
                        </button>
                      </div>
                    </div>

                    <div className='space-y-2 pt-2 border-t border-slate-100'>
                      <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                        Vai trò (Role)
                      </h4>
                      <div className='flex flex-col gap-0.5'>
                        <button
                          className={filterBtnClass(!roleParam)}
                          onClick={() => updateUrl({ role: '', page: 1 })}>
                          Tất cả vai trò
                        </button>
                        {ROLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            className={filterBtnClass(roleParam === opt.value)}
                            onClick={() => updateUrl({ role: opt.value, page: 1 })}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </FilterPopover>

                <SortPopover
                  options={sortOptions}
                  currentValue={sort}
                  onSelect={setSort}
                  disabled={isLoading || isFetching}
                />
              </>
            }
            footer={
              users.length > 0 && (
                <NextPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalElements}
                  itemsPerPage={pagination.pageSize}
                  onItemsPerPageChange={setSize}
                  onPageChange={setPage}
                  className='bg-slate-50/30'
                />
              )
            }
          >
            <DataTable
              columns={columns}
              data={users}
              isLoading={isLoading}
              emptyState={{
                title: 'Không tìm thấy nhân viên',
                description: 'Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc.',
                icon: <Users className='h-10 w-10 text-slate-400' />,
              }}
            />
          </DataCard>

          {/* Form Modal Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-slate-900">
                  {editingUser ? <Edit2 size={18} className="text-primary" /> : <UserPlus size={18} className="text-primary" />}
                  {editingUser ? 'Cập nhật tài khoản nhân sự' : 'Tạo tài khoản nhân viên mới'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? `Chỉnh sửa thông tin tài khoản của nhân viên @${editingUser.username}.` : 'Điền đầy đủ thông tin để cấp tài khoản truy cập hệ thống.'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 text-left">
                <UserForm
                  onSuccess={() => setIsFormOpen(false)}
                  userId={editingUser?.id}
                  initialData={editingUser ? {
                    username: editingUser.username,
                    fullName: editingUser.fullName,
                    email: editingUser.email,
                    phone: editingUser.phone,
                    role: editingUser.role,
                    status: editingUser.status,
                    password: '',
                  } : undefined}
                />
              </div>
            </DialogContent>
          </Dialog>

          <DeleteConfirmDialog
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={handleDelete}
            isLoading={deleteMutation.isPending}
          />
        </>
      ) : (
        /* RBAC Permissions Matrix Tab */
        <div className="space-y-6">
          <PageHeader
            title="Quyền hạn mặc định theo vai trò (RBAC)"
            description="Xem bảng liệt kê các quyền hạn hệ thống mặc định được gắn sẵn cho từng nhóm vai trò."
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/2">Quyền hạn & Mô tả</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-1/6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">SUPER_ADMIN</span>
                        <span>Quản trị tối cao</span>
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-1/6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">MANAGER</span>
                        <span>Quản lý bộ phận</span>
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-1/6">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold">USER</span>
                        <span>Nhân viên vận hành</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(groupedPermissions).map(([groupKey, permissions]) => (
                    <React.Fragment key={groupKey}>
                      {/* Group Header Row */}
                      <tr className="bg-slate-100/50">
                        <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          {permissionGroups[groupKey as Permission['group']]}
                        </td>
                      </tr>
                      {/* Permission Rows */}
                      {permissions.map((permission) => (
                        <tr key={permission.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="space-y-0.5 text-left">
                              <p className="text-sm font-bold text-slate-800">{permission.name}</p>
                              <p className="text-xs text-slate-400 max-w-xl">{permission.description}</p>
                            </div>
                          </td>
                          {/* Super Admin */}
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              <Switch 
                                checked={initialRolePermissions[permission.key].SUPER_ADMIN} 
                                disabled={true}
                              />
                            </div>
                          </td>
                          {/* Manager */}
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              <Switch 
                                checked={initialRolePermissions[permission.key].MANAGER} 
                                disabled={true}
                                className="disabled:opacity-80 disabled:cursor-default"
                              />
                            </div>
                          </td>
                          {/* User */}
                          <td className="p-4 text-center">
                            <div className="flex justify-center">
                              <Switch 
                                checked={initialRolePermissions[permission.key].USER} 
                                disabled={true}
                                className="disabled:opacity-80 disabled:cursor-default"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* RBAC Info Card */}
            <div className="p-5 bg-indigo-50/20 border-t border-slate-100 flex items-start gap-3 text-left">
              <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-800">Cơ chế bảo mật theo vai trò</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bảng ma trận RBAC thể hiện danh sách quyền hạn được gán mặc định cho từng vai trò trong hệ thống. Khi gán vai trò tương ứng cho nhân sự ở danh sách tài khoản, các quyền hạn này sẽ tự động được áp dụng để bật/tắt các tính năng, menu truy cập và quyền thực thi hành động tương ứng.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
