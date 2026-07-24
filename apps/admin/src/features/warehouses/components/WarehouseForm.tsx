'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  FormSection,
  FormGrid,
  AdminFormLabel,
  FormActionsBar,
} from '@/components/common';
import { warehouseSchema, WarehouseFormValues } from '../schemas/warehouse.schema';
import { useCreateWarehouse, useUpdateWarehouse } from '../hooks/use-warehouses';
import { cn } from '@/lib/utils';

interface WarehouseFormProps {
  onSuccess?: () => void;
  initialData?: WarehouseFormValues & { id?: string };
  isDialog?: boolean;
}

export default function WarehouseForm({ onSuccess, initialData, isDialog = false }: WarehouseFormProps) {
  const router = useRouter();
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      address: '',
      isActive: true,
    },
  });

  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/warehouses');
    }
  };

  async function onSubmit(values: WarehouseFormValues) {
    const payload = {
      name: values.name,
      isActive: values.isActive,
      code: values.code || '',
      address: values.address || '',
    };

    if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              router.push('/warehouses');
            }
          }
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/warehouses');
          }
        }
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}>
        <div className={cn("space-y-6", isDialog ? "flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2" : "")}>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 animate-in fade-in-30">
            <div className="lg:col-span-7 space-y-6">
              <FormSection 
                title="Thông tin kho bãi" 
                description="Tên và địa chỉ chi tiết của vị trí lưu kho."
              >
                <FormGrid cols={1}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel required>Tên kho bãi</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: Kho trung tâm TP.HCM" {...field} className="h-11 border-slate-200 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Mã định danh kho</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: KHO-HCM-01" {...field} className="h-11 border-slate-200 font-mono" />
                        </FormControl>
                        <FormDescription className="text-[10px] text-slate-400">Nếu để trống hệ thống sẽ tự động tạo mã ngẫu nhiên.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Địa chỉ kho bãi</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ đầy đủ..." {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <FormSection title="Trạng thái">
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                        <div className="flex flex-col gap-0.5">
                          <AdminFormLabel className="mb-0">Trạng thái hoạt động</AdminFormLabel>
                          <span className="text-[10px] text-slate-400">Cho phép nhập/xuất tồn kho từ vị trí này.</span>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="scale-90 data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
            </div>
          </div>
        </div>

        <FormActionsBar
          onCancel={handleCancel}
          isSubmitting={isLoading}
          submitText={initialData?.id ? 'Cập nhật kho bãi' : 'Lưu kho bãi'}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
