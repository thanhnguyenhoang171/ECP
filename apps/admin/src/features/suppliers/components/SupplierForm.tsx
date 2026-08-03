'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  FormSection,
  FormGrid,
  AdminFormLabel,
  FormActionsBar,
} from '@/components/common';
import { supplierSchema, SupplierFormValues } from '../../inventory/schemas/supplier.schema';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/use-suppliers';
import { cn } from '@/lib/utils';

interface SupplierFormProps {
  onSuccess: () => void;
  initialData?: SupplierFormValues & { id?: string };
  isDialog?: boolean;
}

export default function SupplierForm({ onSuccess, initialData, isDialog = false }: SupplierFormProps) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData || {
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      isActive: true,
    },
  });

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: SupplierFormValues) {
    const payload = {
      name: values.name,
      isActive: values.isActive,
      contactName: values.contactName || '',
      phone: values.phone || '',
      email: values.email || '',
      address: values.address || '',
      taxCode: values.taxCode || '',
    };

    if (initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        { onSuccess: () => onSuccess() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onSuccess() });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}>
        <div className={cn("space-y-6", isDialog ? "flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2" : "")}>
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 animate-in fade-in-30">
            <div className="lg:col-span-7 space-y-6">
              <FormSection 
                title="Thông tin cơ bản" 
                description="Tên và địa chỉ liên hệ của nhà cung cấp."
              >
                <FormGrid cols={1}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel required>Tên nhà cung cấp</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: Công ty TNHH Nhập Khẩu Bánh Kẹo ThaiLand Inter Trade" {...field} className="h-11 border-slate-200 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Địa chỉ trụ sở</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ đầy đủ..." {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>

              <FormSection 
                title="Thông tin liên hệ & Thuế" 
                description="Thông tin người đại diện và mã số thuế để xuất hóa đơn."
              >
                <FormGrid cols={2}>
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Người liên hệ</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: Nguyễn Văn A" {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Số điện thoại</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="098..." {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Email</AdminFormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@gmail.com" {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="taxCode"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Mã số thuế</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Nhập MST..." {...field} className="h-11 border-slate-200 font-mono" />
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
                          <AdminFormLabel className="mb-0">Trạng thái hợp tác</AdminFormLabel>
                          <span className="text-[10px] text-slate-400">Cho phép nhập hàng từ NCC này.</span>
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
          onCancel={onSuccess}
          isSubmitting={isLoading}
          submitText={initialData?.id ? 'Cập nhật nhà cung cấp' : 'Lưu nhà cung cấp'}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
