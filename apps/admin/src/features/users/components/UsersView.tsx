'use client';

import React, { useState } from 'react';
import { Users, Wifi, WifiOff, Shield } from 'lucide-react';
import { PageHeader, DataCard, DataTable, type ColumnDef, Badge, Card, CardContent, NextPagination } from '@/components/common';
import { SearchInput, AddNewButton, ImportButton, ExportButton, FilterPopover, SortPopover, EditActionButton, DeleteActionButton, DeleteConfirmDialog } from '@/components/common/view-control';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, ROLE_OPTIONS } from '@/features/users/types/user.interface';
import { useUsers, useDeleteUser, useUserStatistics } from '@/features/users/hooks/use-users';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { toast } from 'sonner';
import { PageResponse } from '@/types/pagination';
import { UserStatistics } from '../api/user.api';

interface UsersViewProps {
  initialData: PageResponse<User>;
  initialStats: UserStatistics;
}

export default function UsersView({ initialData, initialStats }: UsersViewProps) {
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
        const label = user.status === 'active' ? 'Hoạt động' : 'Không hoạt động';
        return (
          <Badge variant={variant} className='text-[10px] font-bold py-0.5 px-2 uppercase border-none'>
            {label}
          </Badge>
        );
      },
    },
    {
      header: 'Trạng thái phiên',
      align: 'center',
      cell: () => (
        <div className='flex items-center justify-center gap-1.5'>
          <div className='h-2 w-2 rounded-full bg-slate-300' />
          <span className='text-[11px] font-medium text-slate-500'>Ngoại tuyến</span>
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
          <EditActionButton onClick={() => toast.info('Tính năng Chỉnh sửa đang được phát triển')} disabled={isLoading || isFetching} />
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

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Quản lý người dùng'
        description='Cấp quyền và quản lý tài khoản người dùng trong hệ thống.'
        actions={
          <>
            <ImportButton onClick={() => toast.info('Tính năng đang được phát triển')} disabled={isLoading || isFetching} />
            <ExportButton onExport={() => toast.info('Tính năng đang được phát triển')} isLoading={false} disabled={isLoading || isFetching} />
            <AddNewButton onClick={() => toast.info('Tính năng đang được phát triển')} disabled={isLoading || isFetching} />
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
              <p className='text-2xl font-black text-slate-900'>{stats.totalUsers}</p>
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
              <p className='text-2xl font-black text-slate-900'>{stats.onlineUsers}</p>
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
              <p className='text-2xl font-black text-slate-900'>{stats.offlineUsers}</p>
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
              <p className='text-2xl font-black text-slate-900'>{stats.managementUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataCard
        isLoading={isLoading}
        isFetching={isFetching}
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder='Tìm kiếm người dùng...' 
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
              <div className='space-y-4 p-1 w-52'>
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
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
