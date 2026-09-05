'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Key, 
  Layers, 
  ArrowLeft, 
  Edit2, 
  Search, 
  CheckCircle2, 
  Shield
} from 'lucide-react';
import { useRole, usePermissions } from '../hooks/use-roles';
import { Breadcrumbs, PageHeader, Badge } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Permission } from '../types/role.interface';

interface RoleDetailViewProps {
  id: string;
}

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

export default function RoleDetailView({ id }: RoleDetailViewProps) {
  const router = useRouter();
  const { data: role, isLoading: isRoleLoading, isError } = useRole(id);
  const { data: allPermissions = [], isLoading: isPermissionsLoading } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');

  const assignedPermissionCodes = useMemo(() => {
    return new Set(role?.permissions?.map((p) => p.code) || []);
  }, [role]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, Permission[]>();
    allPermissions.forEach((perm) => {
      const mod = perm.module || 'SYSTEM';
      if (!map.has(mod)) {
        map.set(mod, []);
      }
      map.get(mod)!.push(perm);
    });
    return map;
  }, [allPermissions]);

  const totalCount = allPermissions.length || 1;
  const assignedCount = assignedPermissionCodes.size;
  const percent = Math.round((assignedCount / totalCount) * 100);

  const breadcrumbItems = [
    { label: 'Hệ thống' },
    { label: 'Vai trò & Phân quyền', href: '/roles' },
    { label: role ? role.name : 'Chi tiết vai trò' },
  ];

  if (isRoleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-60" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-fit mx-auto">
            <Shield size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không tìm thấy vai trò</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vai trò này có thể đã bị xóa hoặc đường dẫn không chính xác.
          </p>
          <Button variant="outline" onClick={() => router.push('/roles')} className="gap-2">
            <ArrowLeft size={16} />
            <span>Quay lại danh sách</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeader
        title={`Vai trò: ${role.name}`}
        description={role.description || 'Xem chi tiết thông tin và ma trận phân quyền được cấp cho vai trò.'}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/roles')}
              className="text-xs font-bold h-9 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Quay lại</span>
            </Button>
            <Button
              onClick={() => router.push(`/roles/${role.id}/edit`)}
              className="bg-primary text-white text-xs font-bold h-9 rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <Edit2 size={14} />
              <span>Chỉnh sửa vai trò</span>
            </Button>
          </div>
        }
      />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Role Identity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Mã định danh</span>
            <div className={cn(
              'p-2 rounded-xl border flex items-center justify-center shrink-0',
              role.code === 'SUPER_ADMIN'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : role.isSystem
                  ? 'bg-purple-50 text-purple-600 border-purple-200'
                  : 'bg-blue-50 text-blue-600 border-blue-200'
            )}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <p className="text-lg font-black font-mono tracking-wider text-slate-900">{role.code}</p>
            <div className="mt-1 flex items-center gap-1.5">
              {role.code === 'SUPER_ADMIN' ? (
                <Badge variant="outline" className="bg-amber-100/70 text-amber-800 border-amber-200 text-[10px] font-extrabold py-0.5 px-2">
                  Toàn quyền hệ thống
                </Badge>
              ) : role.isSystem ? (
                <Badge variant="outline" className="bg-purple-100/60 text-purple-700 border-purple-200 text-[10px] font-bold py-0.5 px-2">
                  Mặc định hệ thống
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-100/60 text-blue-700 border-blue-200 text-[10px] font-bold py-0.5 px-2">
                  Vai trò tùy chỉnh
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Coverage Metric */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Độ phủ quyền hạn</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Key size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-blue-700">{assignedCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {totalCount} quyền ({percent}%)</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Modules In Use */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Phân nhóm nghiệp vụ</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-amber-700">{groupedPermissions.size}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Nhóm Module chức năng được tích hợp
            </p>
          </div>
        </div>
      </div>

      {/* Permission Matrix Detail View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="text-primary" size={18} />
              <span>Ma trận quyền hạn chi tiết</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các quyền hạn có biểu tượng màu xanh là những quyền đã được gán cho vai trò này.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Lọc quyền theo tên hoặc mã..."
              className="pl-9 text-xs h-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {isPermissionsLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from(groupedPermissions.entries()).map(([modKey, modPerms]) => {
              const filteredModPerms = modPerms.filter(
                (p) =>
                  !searchTerm.trim() ||
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.code.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredModPerms.length === 0) return null;

              const grantedCount = modPerms.filter((p) => assignedPermissionCodes.has(p.code)).length;

              return (
                <div key={modKey} className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Layers size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{getModuleName(modKey)}</span>
                    </div>
                    <Badge variant="outline" className={cn(
                      'text-[10px] font-mono font-bold py-0.5 px-2',
                      grantedCount > 0
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    )}>
                      Đã cấp: {grantedCount}/{modPerms.length} quyền
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {filteredModPerms.map((perm) => {
                      const isGranted = assignedPermissionCodes.has(perm.code);
                      return (
                        <div
                          key={perm.id || perm.code}
                          className={cn(
                            'p-2.5 rounded-xl border transition-all flex items-start gap-2.5',
                            isGranted
                              ? 'bg-white border-blue-200 shadow-2xs text-slate-900'
                              : 'bg-slate-100/40 border-slate-200/50 text-slate-400 opacity-60'
                          )}
                        >
                          <div className={cn(
                            'mt-0.5 p-1 rounded-full shrink-0',
                            isGranted ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-400'
                          )}>
                            <CheckCircle2 size={13} />
                          </div>
                          <div className="leading-tight space-y-0.5">
                            <p className="text-xs font-bold text-slate-900">{perm.name || perm.code}</p>
                            <p className="text-[10px] font-mono text-slate-400">{perm.code}</p>
                            {perm.description && (
                              <p className="text-[10px] text-slate-500 line-clamp-1">{perm.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
