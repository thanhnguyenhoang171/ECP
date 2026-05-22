'use client';

import React, { useState } from 'react';
import { Users, Wifi, WifiOff, Shield } from 'lucide-react';
import { PageHeader, DataCard, DataTable, type ColumnDef, Badge, Card, CardContent } from '@/components/common';
import { SearchInput, AddNewButton, ImportButton, ExportButton, FilterPopover, EditActionButton, DeleteActionButton, DeleteConfirmDialog } from '@/components/common/view-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, ROLE_OPTIONS, MOCK_USERS } from '@/features/users/types/user.interface';

export default function UsersView() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = users.filter((u) => u.isOnline).length;
  const roleCounts = {
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    staff: users.filter((u) => u.role === 'staff').length,
    viewer: users.filter((u) => u.role === 'viewer').length,
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
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
          <div>
            <p className='text-sm font-bold text-slate-900'>{user.fullName}</p>
            <p className='text-[11px] text-slate-400'>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      accessorKey: 'phone',
      className: 'text-sm text-slate-600',
    },
    {
      header: 'Vai trò',
      cell: (user) => (
        <Select value={user.role} onValueChange={(val: User['role']) => handleRoleChange(user.id, val)}>
          <SelectTrigger className={cn('h-8 w-[130px] text-xs font-bold border-none', getRoleMeta(user.role)?.color)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className='text-xs font-medium'>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      cell: (user) => {
        const variant = user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary';
        const label = user.status === 'active' ? 'Hoạt động' : user.status === 'suspended' ? 'Đã khoá' : 'Không hoạt động';
        return (
          <Badge variant={variant} className='text-[10px] font-bold py-0.5 px-2 uppercase'>
            {label}
          </Badge>
        );
      },
    },
    {
      header: 'Trực tuyến',
      align: 'center',
      cell: (user) => (
        <div className='flex items-center justify-center gap-1.5'>
          <div className={cn('h-2 w-2 rounded-full', user.isOnline ? 'bg-green-500' : 'bg-slate-300')} />
          <span className='text-[11px] text-slate-500'>{user.lastActive}</span>
        </div>
      ),
    },
    {
      header: 'Ngày tạo',
      align: 'center',
      accessorKey: 'createdAt',
      className: 'text-xs text-slate-500',
    },
    {
      header: 'Thao tác',
      align: 'right',
      cell: (user) => (
        <div className='flex justify-end gap-1'>
          <EditActionButton onClick={() => {}} />
          <DeleteActionButton onClick={() => setDeleteConfirmId(user.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Quản lý người dùng'
        description='Cấp quyền và quản lý tài khoản người dùng trong hệ thống.'
        actions={
          <>
            <ImportButton onClick={() => {}} />
            <ExportButton onExport={() => {}} isLoading={false} />
            <AddNewButton onClick={() => {}} />
          </>
        }
      />

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='flex items-center gap-3 pt-6'>
            <div className='p-2.5 rounded-xl bg-blue-50 text-blue-600'>
              <Users size={20} />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Tổng người dùng</p>
              <p className='text-2xl font-black text-slate-900'>{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3 pt-6'>
            <div className='p-2.5 rounded-xl bg-green-50 text-green-600'>
              <Wifi size={20} />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Đang trực tuyến</p>
              <p className='text-2xl font-black text-slate-900'>{onlineCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3 pt-6'>
            <div className='p-2.5 rounded-xl bg-slate-50 text-slate-600'>
              <WifiOff size={20} />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Ngoại tuyến</p>
              <p className='text-2xl font-black text-slate-900'>{users.length - onlineCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3 pt-6'>
            <div className='p-2.5 rounded-xl bg-purple-50 text-purple-600'>
              <Shield size={20} />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>Admin / Quản lý</p>
              <p className='text-2xl font-black text-slate-900'>{roleCounts.admin + roleCounts.manager}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataCard
        search={<SearchInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm kiếm người dùng...' />}
        extra={
          <FilterPopover activeCount={0} onClear={() => {}}>
            <p className='text-xs text-slate-400'>Chưa có bộ lọc</p>
          </FilterPopover>
        }
      >
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyState={{
            title: 'Không tìm thấy người dùng',
            description: 'Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc.',
            icon: <Users className='h-10 w-10 text-slate-400' />,
          }}
        />
      </DataCard>

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
