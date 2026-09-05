'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Key, 
  Layers, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge, FormSection, FormGrid, AdminFormLabel, FormActionsBar } from '@/components/common';
import { cn } from '@/lib/utils';
import { Role, Permission, RoleRequest } from '../types/role.interface';
import { usePermissions, useCreateRole, useUpdateRole } from '../hooks/use-roles';
import { roleSchema, RoleFormValues } from '../schemas/role.schema';

interface RoleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Role | null;
  roleId?: string;
  isLoadingData?: boolean;
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

export default function RoleForm({
  onSuccess,
  onCancel,
  initialData,
  roleId,
  isLoadingData = false,
}: RoleFormProps) {
  const isEdit = !!initialData || !!roleId;
  const isSystem = initialData?.isSystem ?? false;

  const { data: permissions = [], isLoading: isPermissionsLoading } = usePermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const [permSearchTerm, setPermSearchTerm] = useState('');

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      permissionCodes: initialData?.permissions?.map((p) => p.code) || [],
    },
  });

  const selectedPermissionCodes = form.watch('permissionCodes') || [];

  // Reset form when initialData arrives
  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
        permissionCodes: initialData.permissions?.map((p) => p.code) || [],
      });
    }
  }, [initialData, form]);

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

  // Toggle single permission
  const handleTogglePermission = useCallback(
    (code: string) => {
      const current = form.getValues('permissionCodes');
      const updated = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      form.setValue('permissionCodes', updated, { shouldDirty: true });
    },
    [form]
  );

  // Toggle all permissions in a module
  const handleToggleModule = useCallback(
    (modulePermissions: Permission[]) => {
      const current = form.getValues('permissionCodes');
      const modCodes = modulePermissions.map((p) => p.code);
      const isAllSelected = modCodes.every((c) => current.includes(c));

      const updated = isAllSelected
        ? current.filter((c) => !modCodes.includes(c))
        : Array.from(new Set([...current, ...modCodes]));

      form.setValue('permissionCodes', updated, { shouldDirty: true });
    },
    [form]
  );

  // Quick select all / deselect all
  const handleSelectAll = useCallback(() => {
    form.setValue(
      'permissionCodes',
      permissions.map((p) => p.code),
      { shouldDirty: true }
    );
  }, [form, permissions]);

  const handleDeselectAll = useCallback(() => {
    form.setValue('permissionCodes', [], { shouldDirty: true });
  }, [form]);

  // Check if any permissions match search
  const hasAnyMatch = useMemo(() => {
    if (!permSearchTerm.trim()) return true;
    const term = permSearchTerm.toLowerCase();
    return permissions.some(
      (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
    );
  }, [permSearchTerm, permissions]);

  // Coverage percentage
  const totalCount = permissions.length || 1;
  const assignedCount = selectedPermissionCodes.length;
  const coveragePercent = Math.round((assignedCount / totalCount) * 100);

  const onSubmit = (values: RoleFormValues) => {
    const payload: RoleRequest = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim(),
      permissionCodes: values.permissionCodes,
    };

    const targetId = initialData?.id || roleId;

    if (isEdit && targetId) {
      updateMutation.mutate(
        { id: targetId, data: payload },
        {
          onSuccess: () => {
            onSuccess();
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess();
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoadingData) {
    return (
      <div className="space-y-6 pb-28">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-28">
        {/* Section 1: Thông tin vai trò */}
        <FormSection
          title="Thông tin vai trò"
          description="Khai báo các thông tin định danh và mô tả phạm vi chức trách của vai trò."
        >
          {isSystem && (
            <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3 text-amber-800">
              <ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">Vai trò mặc định hệ thống</p>
                <p className="text-amber-700">
                  Mã vai trò hệ thống được bảo vệ và không thể chỉnh sửa nhằm đảm bảo tính toàn vẹn của hệ thống phân quyền. Bạn vẫn có thể tùy chỉnh tên hiển thị, mô tả và ma trận quyền hạn.
                </p>
              </div>
            </div>
          )}

          <FormGrid cols={2}>
            {/* Mã vai trò */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <AdminFormLabel required>Mã vai trò (Role Code)</AdminFormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: WAREHOUSE_KEEPER"
                      disabled={isSubmitting || isSystem}
                      className="h-11 border-slate-200 font-mono text-xs uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.toUpperCase().replace(/\s+/g, '_')
                        )
                      }
                    />
                  </FormControl>
                  <p className="text-[10px] text-slate-400">
                    Quy chuẩn: chữ hoa, không dấu, phân cách bằng dấu gạch dưới (vd: ORDER_DISPATCHER).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tên vai trò */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <AdminFormLabel required>Tên hiển thị vai trò</AdminFormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Nhân viên điều phối kho"
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[10px] text-slate-400">
                    Tên hiển thị thân thiện xuất hiện trên giao diện quản trị người dùng.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả vai trò */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1.5 md:col-span-2">
                  <AdminFormLabel>Mô tả chức năng & quyền hạn</AdminFormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Mô tả ngắn gọn quyền hạn và trách nhiệm của vai trò này trong quy trình vận hành..."
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        {/* Section 2: Ma trận phân quyền */}
        <FormSection
          title="Ma trận phân quyền hệ thống"
          description="Lựa chọn các đặc quyền nghiệp vụ chi tiết được cấp phát cho vai trò này."
        >
          <div className="space-y-4">
            {/* Header controls: Progress & Search & Quick Select */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-primary" />
                    <span className="text-xs font-bold text-slate-900">
                      Mức độ bao quát quyền hạn
                    </span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono font-bold">
                      {assignedCount}/{totalCount} ({coveragePercent}%)
                    </Badge>
                  </div>
                  <div className="h-2 w-48 sm:w-64 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${coveragePercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isPermissionsLoading}
                    className="text-xs font-bold h-8 px-3 rounded-lg border-slate-200 bg-white"
                  >
                    Chọn tất cả ({permissions.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isPermissionsLoading || assignedCount === 0}
                    className="text-xs font-bold h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-500"
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              {/* Search within permissions */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  placeholder="Lọc nhanh danh sách quyền theo tên quyền, mã quyền..."
                  className="pl-9 text-xs bg-white h-9 border-slate-200"
                />
              </div>
            </div>

            {/* Permissions List Grouped by Module */}
            {isPermissionsLoading ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : !hasAnyMatch ? (
              <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-700">Không tìm thấy quyền hạn nào</p>
                <p className="text-[11px] text-slate-400">
                  Không có quyền nào khớp với từ khóa &quot;{permSearchTerm}&quot;.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPermSearchTerm('')}
                  className="text-xs font-bold text-primary h-8 px-3"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(groupedPermissions.entries()).map(([modKey, modPerms]) => {
                  const filteredModPerms = modPerms.filter(
                    (p) =>
                      !permSearchTerm.trim() ||
                      p.name.toLowerCase().includes(permSearchTerm.toLowerCase()) ||
                      p.code.toLowerCase().includes(permSearchTerm.toLowerCase())
                  );

                  if (filteredModPerms.length === 0) return null;

                  const modCodes = modPerms.map((p) => p.code);
                  const isAllSelected = modCodes.every((c) =>
                    selectedPermissionCodes.includes(c)
                  );
                  const selectedInModule = modPerms.filter((p) =>
                    selectedPermissionCodes.includes(p.code)
                  ).length;

                  return (
                    <div
                      key={modKey}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Layers size={15} />
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {getModuleName(modKey)}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-slate-400">
                            ({selectedInModule}/{modPerms.length} đã chọn)
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleModule(modPerms)}
                          className="text-[11px] font-bold h-7 px-2.5 text-primary hover:bg-primary/10 rounded-lg"
                        >
                          {isAllSelected ? 'Bỏ chọn Module này' : 'Chọn cả Module'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {filteredModPerms.map((perm) => {
                          const checked = selectedPermissionCodes.includes(perm.code);
                          return (
                            <label
                              key={perm.id || perm.code}
                              className={cn(
                                'flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all',
                                checked
                                  ? 'bg-blue-50/70 border-blue-200 shadow-2xs text-slate-900 font-medium'
                                  : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => handleTogglePermission(perm.code)}
                                className="mt-0.5"
                              />
                              <div className="leading-tight space-y-0.5">
                                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                  <span>{perm.name || perm.code}</span>
                                  {checked && <CheckCircle2 size={12} className="text-blue-600 inline shrink-0" />}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">{perm.code}</p>
                                {perm.description && (
                                  <p className="text-[10px] text-slate-500 line-clamp-1">{perm.description}</p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FormSection>

        {/* Sticky Form Actions Bar */}
        <FormActionsBar
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          submitText={isEdit ? 'Lưu thay đổi vai trò' : 'Tạo vai trò mới'}
        />
      </form>
    </Form>
  );
}
