'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Key, 
  Layers 
} from 'lucide-react';
import { 
  PageHeader, 
  DataCard, 
  DataTable, 
  type ColumnDef, 
  Badge, 
  Breadcrumbs
} from '@/components/common';
import { 
  SearchInput, 
  AddNewButton, 
  FilterPopover,
  SortPopover,
  ResetFiltersButton,
  ViewActionButton,
  EditActionButton, 
  DeleteActionButton, 
  DeleteConfirmDialog 
} from '@/components/common/view-control';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Role, Permission } from '../types/role.interface';
import { 
  useRoles, 
  usePermissions, 
  useDeleteRole,
} from '../hooks/use-roles';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { useHotkeys } from '@/hooks/use-hotkeys';

interface RolesViewProps {
  initialRoles?: Role[];
}

// Map tên Module tiếng Anh sang tiếng Việt
const MODULE_NAMES: Record<string, string> = {
  USER: 'Quản lý Tài khoản & Người dùng',
  ROLE: 'Quản lý Vai trò & Phân quyền',
  PRODUCT: 'Quản lý Sản phẩm & Thương hiệu',
  CATEGORY: 'Quản lý Danh mục sản phẩm',
  INVENTORY: 'Quản lý Kho hàng & Tồn kho',
  AUDIT: 'Nhật ký Hệ thống & Kiểm toán',
  SYSTEM: 'Cấu hình Hệ thống',
};

const getModuleName = (moduleKey: string): string => {
  const upper = (moduleKey || 'SYSTEM').toUpperCase();
  return MODULE_NAMES[upper] || `Module ${upper}`;
};

export default function RolesView({ initialRoles }: RolesViewProps) {
  const router = useRouter();

  // Fetch Roles & Permissions từ Backend
  const { data: roles = [], isLoading: isRolesLoading, isFetching: isRolesFetching } = useRoles(initialRoles);
  const { data: permissions = [], isLoading: isPermissionsLoading } = usePermissions();

  const deleteMutation = useDeleteRole();

  // URL Query Params State (Đồng bộ Search, Sort, Filter với URL)
  const {
    sort,
    name,
    updateUrl,
    setSort,
    searchParams,
  } = useViewParams('name,asc');

  const typeFilter = searchParams.get('type') || 'all'; // 'all' | 'system' | 'custom'

  const handleSearch = useCallback((val: string) => {
    updateUrl({ name: val });
  }, [updateUrl]);

  const [searchTerm, setSearchTerm] = useDebounceSearch(name, handleSearch);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Permission[]>();
    permissions.forEach((perm) => {
      const mod = perm.module || 'SYSTEM';
      if (!map.has(mod)) {
        map.set(mod, []);
      }
      map.get(mod)!.push(perm);
    });
    return map;
  }, [permissions]);

  // Page-based CRUD Navigation Handlers
  const handleCreateRole = useCallback(() => {
    router.push('/roles/create');
  }, [router]);

  const handleEditRole = useCallback((role: Role) => {
    router.push(`/roles/${role.id}/edit`);
  }, [router]);

  const handleViewRoleDetail = useCallback((role: Role) => {
    router.push(`/roles/${role.id}`);
  }, [router]);

  // Hotkey '+' to quickly navigate to create role page
  useHotkeys('+', handleCreateRole);

  // Filter & Sort Roles based on URL params
  const processedRoles = useMemo(() => {
    let list = [...roles];

    // Search filter
    if (name.trim()) {
      const term = name.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.code.toLowerCase().includes(term) ||
          (r.description || '').toLowerCase().includes(term)
      );
    }

    // Role type filter
    if (typeFilter === 'system') {
      list = list.filter((r) => r.isSystem);
    } else if (typeFilter === 'custom') {
      list = list.filter((r) => !r.isSystem);
    }

    // Sorting
    list.sort((a, b) => {
      if (sort === 'name,asc') return a.name.localeCompare(b.name, 'vi');
      if (sort === 'name,desc') return b.name.localeCompare(a.name, 'vi');
      if (sort === 'permissions,desc') return (b.permissions?.length || 0) - (a.permissions?.length || 0);
      if (sort === 'permissions,asc') return (a.permissions?.length || 0) - (b.permissions?.length || 0);
      return a.name.localeCompare(b.name, 'vi');
    });

    return list;
  }, [roles, name, typeFilter, sort]);



  // Handle Delete Role
  const handleDeleteRole = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
        },
      });
    }
  }, [deleteConfirmId, deleteMutation]);

  // Sort Options for SortPopover
  const sortOptions = [
    { value: 'name,asc', label: 'Tên vai trò (A-Z)' },
    { value: 'name,desc', label: 'Tên vai trò (Z-A)' },
    { value: 'permissions,desc', label: 'Nhiều quyền hạn nhất' },
    { value: 'permissions,asc', label: 'Ít quyền hạn nhất' },
  ];

  // Helper filter button class
  const filterBtnClass = (active: boolean) =>
    cn(
      'justify-start font-medium text-xs px-3 py-2 rounded-lg text-left transition-all flex items-center w-full',
      active
        ? 'bg-primary/10 text-primary font-bold'
        : 'bg-transparent hover:bg-slate-50 text-slate-600',
    );

  // Table Columns Definition
  const columns: ColumnDef<Role>[] = useMemo(() => [
    {
      header: 'Tên Vai trò',
      className: 'w-[26%] min-w-[200px]',
      headerClassName: 'w-[26%] min-w-[200px]',
      skeleton: <Skeleton className='h-6 w-36' />,
      cell: (role) => (
        <div className='flex items-center gap-3'>
          <div className={cn(
            'p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs',
            role.code === 'SUPER_ADMIN'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : role.isSystem 
                ? 'bg-purple-50 text-purple-600 border-purple-200' 
                : 'bg-blue-50 text-blue-600 border-blue-200'
          )}>
            <ShieldCheck size={18} />
          </div>
          <div className="text-left">
            <div className='text-sm font-bold text-slate-900 flex items-center gap-2'>
              <span>{role.name}</span>
              {role.code === 'SUPER_ADMIN' ? (
                <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-200 text-[10px] font-extrabold py-0.5 px-2">
                  Toàn quyền
                </Badge>
              ) : role.isSystem ? (
                <Badge variant="outline" className="bg-purple-100/60 text-purple-700 border-purple-200 text-[10px] font-bold py-0.5 px-2">
                  Hệ thống
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100/60 text-blue-700 border-blue-200 text-[10px] font-bold py-0.5 px-2">
                  Tùy chỉnh
                </Badge>
              )}
            </div>
            <p className='text-[11px] font-mono text-slate-400 uppercase tracking-wider'>{role.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Mô tả vai trò',
      accessorKey: 'description',
      className: 'w-[32%] min-w-[220px] text-xs text-slate-500 font-medium',
      headerClassName: 'w-[32%] min-w-[220px]',
      skeleton: <Skeleton className='h-4 w-48' />,
      cell: (role) => (
        <span className={cn('text-xs line-clamp-2', role.description ? 'text-slate-600' : 'text-slate-400 italic')}>
          {role.description || 'Chưa có mô tả chi tiết'}
        </span>
      ),
    },
    {
      header: 'Độ phủ quyền hạn',
      align: 'center',
      className: 'w-[24%] min-w-[170px]',
      headerClassName: 'w-[24%] min-w-[170px]',
      skeleton: <Skeleton className='h-6 w-24 mx-auto rounded-full' />,
      cell: (role) => {
        const assignedCount = role.permissions?.length || 0;
        const totalCount = permissions.length || 1;
        const percent = Math.round((assignedCount / totalCount) * 100);

        return (
          <button
            type="button"
            onClick={() => handleViewRoleDetail(role)}
            className="group inline-flex items-center gap-1.5 focus:outline-none"
            title="Bấm để xem chi tiết phân quyền"
          >
            <Badge 
              variant='outline' 
              className={cn(
                'border transition-all text-xs font-mono font-bold py-1 px-3 flex items-center gap-1.5 cursor-pointer shadow-2xs',
                role.code === 'SUPER_ADMIN'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 group-hover:bg-amber-100'
                  : assignedCount > 0
                    ? 'bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
              )}
            >
              <Key size={12} className="opacity-70" />
              <span>{assignedCount}/{totalCount} quyền</span>
              <span className="text-[10px] font-sans font-semibold opacity-60">({percent}%)</span>
            </Badge>
          </button>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right',
      className: 'w-[18%] min-w-[140px]',
      headerClassName: 'w-[18%] min-w-[140px]',
      skeleton: <Skeleton className='h-8 w-24 ml-auto rounded-lg' />,
      cell: (role) => (
        <div className='flex justify-end gap-1.5'>
          <ViewActionButton 
            onClick={() => handleViewRoleDetail(role)} 
            disabled={isRolesLoading || isRolesFetching} 
          />
          <EditActionButton 
            onClick={() => handleEditRole(role)} 
            disabled={isRolesLoading || isRolesFetching} 
          />
          <DeleteActionButton 
            onClick={() => setDeleteConfirmId(role.id)} 
            disabled={isRolesLoading || isRolesFetching || role.isSystem || role.code === 'SUPER_ADMIN'} 
          />
        </div>
      ),
    },
  ], [handleEditRole, handleViewRoleDetail, isRolesFetching, isRolesLoading, permissions.length]);

  const breadcrumbItems = [
    { label: 'Hệ thống' },
    { label: 'Vai trò & Phân quyền' },
  ];

  const activeFiltersCount = typeFilter !== 'all' ? 1 : 0;

  return (
    <div className='space-y-6'>
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title='Quản lý Vai trò & Phân quyền'
        description='Cấu hình danh mục vai trò hệ thống và gán ma trận phân quyền chi tiết cho từng vai trò.'
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/roles/permissions/create')}
              disabled={isPermissionsLoading}
              className="text-xs font-bold h-9 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Key size={14} className="text-primary" />
              <span>Thêm quyền mới</span>
            </Button>
            <AddNewButton onClick={handleCreateRole} disabled={isRolesLoading || isRolesFetching} label="Tạo vai trò mới" />
          </div>
        }
      />

      {/* Top Statistics Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Roles */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tổng vai trò hệ thống</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          {isRolesLoading ? (
            <div className="space-y-1.5 py-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3.5 w-36" />
            </div>
          ) : (
            <>
              <p className="text-xl font-black text-slate-900 font-mono">{roles.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                {roles.filter((r) => r.isSystem).length} mặc định hệ thống • {roles.filter((r) => !r.isSystem).length} tùy chỉnh
              </p>
            </>
          )}
        </div>

        {/* Card 2: Modules */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Nhóm Module phân quyền</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          {isPermissionsLoading ? (
            <div className="space-y-1.5 py-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ) : (
            <>
              <p className="text-xl font-black text-amber-700 font-mono">{groupedPermissions.size}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Bao quát {permissions.length} đặc quyền nghiệp vụ
              </p>
            </>
          )}
        </div>

        {/* Card 3: Total Permissions */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tổng quyền hạn khả dụng</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Key className="w-4 h-4" />
            </div>
          </div>
          {isPermissionsLoading ? (
            <div className="space-y-1.5 py-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          ) : (
            <>
              <p className="text-xl font-black text-blue-700 font-mono">{permissions.length}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Sẵn sàng gán ma trận truy cập hệ thống
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Data Table Card */}
      <DataCard
        isLoading={isRolesLoading}
        isFetching={isRolesFetching}
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder='Tìm kiếm vai trò theo tên, mã vai trò, mô tả...' 
            isLoading={isRolesLoading || isRolesFetching}
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={activeFiltersCount}
              onClear={() => updateUrl({ type: '' })}
              disabled={isRolesLoading || isRolesFetching}
            >
              <div className='space-y-2 p-1 w-48 text-left'>
                <h4 className='font-bold text-[10px] uppercase tracking-wider text-slate-400 px-3'>
                  Loại vai trò
                </h4>
                <div className='flex flex-col gap-0.5'>
                  <button
                    className={filterBtnClass(typeFilter === 'all')}
                    onClick={() => updateUrl({ type: 'all' })}>
                    Tất cả vai trò
                  </button>
                  <button
                    className={filterBtnClass(typeFilter === 'system')}
                    onClick={() => updateUrl({ type: 'system' })}>
                    Mặc định hệ thống
                  </button>
                  <button
                    className={filterBtnClass(typeFilter === 'custom')}
                    onClick={() => updateUrl({ type: 'custom' })}>
                    Vai trò tùy chỉnh
                  </button>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <ResetFiltersButton onClick={() => updateUrl({ type: '' })} />
                  </div>
                )}
              </div>
            </FilterPopover>

            <SortPopover
              options={sortOptions}
              currentValue={sort}
              onSelect={setSort}
              disabled={isRolesLoading || isRolesFetching}
            />
          </>
        }
      >
        <DataTable
          columns={columns}
          data={processedRoles}
          isLoading={isRolesLoading}
          loadingRows={roles.length || 4}
          emptyState={{
            title: searchTerm || typeFilter !== 'all' ? 'Không tìm thấy vai trò phù hợp' : 'Chưa có vai trò nào',
            description: searchTerm || typeFilter !== 'all' 
              ? 'Không có vai trò nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại.'
              : 'Bắt đầu bằng cách tạo vai trò mới cho hệ thống.',
          }}
        />
      </DataCard>

      {/* DELETE CONFIRM DIALOG */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteRole}
        isLoading={deleteMutation.isPending}
        title="Xác nhận xóa vai trò"
        description="Bạn có chắc chắn muốn xóa vai trò tùy chỉnh này khỏi hệ thống? Các tài khoản đang gán vai trò này sẽ cần được phân lại vai trò mới."
      />


    </div>
  );
}
