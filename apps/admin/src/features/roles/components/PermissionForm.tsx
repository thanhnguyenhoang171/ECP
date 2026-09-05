'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Layers, Info } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormSection, FormGrid, AdminFormLabel, FormActionsBar } from '@/components/common';
import { cn } from '@/lib/utils';
import { usePermissions, useCreatePermission } from '../hooks/use-roles';
import { permissionSchema, PermissionFormValues } from '../schemas/permission.schema';

interface PermissionFormProps {
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

const DEFAULT_MODULES = [
  'USER',
  'ROLE',
  'PRODUCT',
  'CATEGORY',
  'INVENTORY',
  'AUDIT',
  'SYSTEM',
] as const;

export default function PermissionForm({
  onSuccess,
  onCancel,
}: PermissionFormProps): React.JSX.Element {
  const { data: permissions = [] } = usePermissions();
  const createMutation = useCreatePermission();

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      code: '',
      name: '',
      module: 'SYSTEM',
      description: '',
    },
  });

  const currentModule = form.watch('module');

  // Collect available unique modules from existing permissions + default list
  const availableModules = useMemo(() => {
    const set = new Set<string>(DEFAULT_MODULES);
    permissions.forEach((perm) => {
      if (perm.module) {
        set.add(perm.module.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [permissions]);

  const onSubmit = (values: PermissionFormValues): void => {
    createMutation.mutate(
      {
        code: values.code.trim().toLowerCase(),
        name: values.name.trim(),
        module: values.module.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-28">
        {/* Section 1: Định danh đặc quyền */}
        <FormSection
          title="Thông tin định danh đặc quyền"
          description="Khai báo mã định danh hệ thống, tên hiển thị và phân loại nhóm module quản trị."
        >
          <div className="mb-4 p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-3 text-blue-800">
            <Info size={18} className="shrink-0 text-blue-600 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">Quy chuẩn mã quyền hạn</p>
              <p className="text-blue-700">
                Mã quyền hạn nên tuân thủ cú pháp <code className="font-mono font-semibold bg-blue-100/80 px-1 py-0.5 rounded">module:action</code> (ví dụ: <code className="font-mono font-semibold">product:create</code>, <code className="font-mono font-semibold">order:export</code>, <code className="font-mono font-semibold">report:view</code>) để thuận tiện cho việc kiểm soát phân quyền qua API Gateway và Middleware.
              </p>
            </div>
          </div>

          <FormGrid cols={2}>
            {/* Mã quyền hạn */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <AdminFormLabel required>Mã quyền hạn (Permission Code)</AdminFormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="ví dụ: product:export"
                        disabled={isSubmitting}
                        className="h-11 pl-9 border-slate-200 font-mono text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.toLowerCase().replace(/\s+/g, '')
                          )
                        }
                      />
                      <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </FormControl>
                  <p className="text-[10px] text-slate-400">
                    Chữ thường, không dấu, phân cách bằng dấu hai chấm hoặc gạch dưới.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tên quyền hạn */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <AdminFormLabel required>Tên quyền hạn hiển thị</AdminFormLabel>
                  <FormControl>
                    <Input
                      placeholder="ví dụ: Xuất dữ liệu sản phẩm"
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[10px] text-slate-400">
                    Tên hiển thị rõ ràng trên giao diện phân quyền vai trò.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nhóm Module */}
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem className="space-y-1.5 md:col-span-2">
                  <AdminFormLabel required>Nhóm Module (Phân loại)</AdminFormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="ví dụ: PRODUCT, ORDER, REPORT..."
                        disabled={isSubmitting}
                        className="h-11 pl-9 border-slate-200 font-mono text-xs uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.toUpperCase().replace(/\s+/g, '_')
                          )
                        }
                      />
                      <Layers className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </FormControl>

                  {/* Suggestion Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">Gợi ý nhóm module sẵn có:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableModules.map((mod) => {
                        const isSelected = currentModule?.toUpperCase() === mod;
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => form.setValue('module', mod, { shouldValidate: true })}
                            className={cn(
                              'text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            )}
                          >
                            {mod}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        {/* Section 2: Mô tả quyền hạn */}
        <FormSection
          title="Mô tả phạm vi tác vụ"
          description="Cung cấp diễn giải chi tiết về các chức năng hoặc tài nguyên được mở khóa bởi quyền hạn này."
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <AdminFormLabel>Mô tả chi tiết</AdminFormLabel>
                <FormControl>
                  <textarea
                    placeholder="Mô tả cụ thể tác vụ được phép thực hiện, giới hạn truy cập hoặc điều kiện kiểm tra..."
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        {/* Sticky Form Actions Bar */}
        <FormActionsBar
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          submitText="Tạo quyền hạn mới"
        />
      </form>
    </Form>
  );
}
