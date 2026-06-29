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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { warehouseSchema, WarehouseFormValues } from '../schemas/warehouse.schema';
import { clientDb } from '@/lib/clientDb';

interface WarehouseFormProps {
  onSuccess: () => void;
  initialData?: WarehouseFormValues & { id?: string };
}

export default function WarehouseForm({ onSuccess, initialData }: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      address: '',
      isActive: true,
    },
  });

  const isLoading = false; // Demo mode

  async function onSubmit(values: WarehouseFormValues) {
    clientDb.saveWarehouse({
      id: initialData?.id,
      name: values.name,
      isActive: values.isActive,
      code: values.code || '',
      address: values.address || '',
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Tên kho <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Kho trung tâm TP.HCM" {...field} />
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
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Mã kho</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: KHO-HCM-01" {...field} />
                </FormControl>
                <FormDescription className="text-[10px]">Nếu để trống hệ thống sẽ tự động tạo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Địa chỉ</FormLabel>
                <FormControl>
                  <Input placeholder="Địa chỉ chi tiết..." {...field} />
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
                  <FormLabel className="text-sm font-medium text-slate-700">Trạng thái hoạt động</FormLabel>
                  <div className="text-[10px] text-slate-400">Cho phép nhập/xuất kho từ địa điểm này</div>
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
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onSuccess}>Hủy</Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 px-8" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Cập nhật' : 'Lưu thông tin'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
