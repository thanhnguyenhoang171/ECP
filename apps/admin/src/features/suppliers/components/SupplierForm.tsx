'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supplierSchema, SupplierFormValues } from '../../inventory/schemas/supplier.schema';
import { clientDb } from '@/lib/clientDb';

interface SupplierFormProps {
  onSuccess: () => void;
  initialData?: SupplierFormValues & { id?: string };
}

export default function SupplierForm({ onSuccess, initialData }: SupplierFormProps) {
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

  const isLoading = false;

  async function onSubmit(values: SupplierFormValues) {
    clientDb.saveSupplier({
      id: initialData?.id,
      ...values,
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Tên nhà cung cấp <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Vd: Công ty TNHH Cung ứng ABC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Người liên hệ</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Nguyễn Văn A" {...field} />
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
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="098..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@gmail.com" {...field} />
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
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Mã số thuế</FormLabel>
                <FormControl>
                  <Input placeholder="MST" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Địa chỉ trụ sở</FormLabel>
              <FormControl>
                <Input placeholder="Địa chỉ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3 bg-slate-50/50">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">Trạng thái hợp tác</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onSuccess}>Hủy</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 px-8" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Cập nhật' : 'Lưu nhà cung cấp'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
