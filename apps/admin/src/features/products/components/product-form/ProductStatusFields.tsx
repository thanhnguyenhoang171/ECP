'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { FormGrid, FormSection } from '@/components/common';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ProductFormValues } from '../../schemas/product.schema';

interface ProductStatusFieldsProps {
  readonly form: UseFormReturn<ProductFormValues>;
}

const statusFields = [
  { name: 'isPublished', label: 'Hiển thị trên cửa hàng', description: 'Cho phép khách hàng xem sản phẩm.' },
  { name: 'isFeatured', label: 'Sản phẩm nổi bật', description: 'Hiển thị trong nhóm sản phẩm nổi bật.' },
  { name: 'isNew', label: 'Sản phẩm mới', description: 'Gắn nhãn sản phẩm mới.' },
  { name: 'isBestSeller', label: 'Sản phẩm bán chạy', description: 'Gắn nhãn sản phẩm bán chạy.' },
] as const;

const statisticFields = [
  { name: 'viewCount', label: 'Lượt xem', max: 2147483647, step: 1 },
  { name: 'soldCount', label: 'Số lượng đã bán', max: 2147483647, step: 1 },
  { name: 'ratingAvg', label: 'Điểm đánh giá trung bình', max: 5, step: 'any' },
  { name: 'ratingCount', label: 'Số lượt đánh giá', max: 2147483647, step: 1 },
] as const;

export const ProductStatusFields = ({ form }: ProductStatusFieldsProps): React.JSX.Element => (
  <div className='space-y-6'>
    <FormSection title='Trạng thái & Hiển thị'>
      <FormGrid cols={2}>
        {statusFields.map(({ name, label, description }) => (
          <FormField key={name} control={form.control} name={name} render={({ field }) => (
            <FormItem className='flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4'>
              <div className='space-y-1'>
                <FormLabel className='text-xs font-bold'>{label}</FormLabel>
                <FormDescription className='text-xs'>{description}</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
              </FormControl>
            </FormItem>
          )} />
        ))}
      </FormGrid>
    </FormSection>
    <FormSection title='Thống kê sản phẩm' description='Quản lý lượt xem, số lượng đã bán và các chỉ số đánh giá.'>
      <FormGrid cols={2}>
        {statisticFields.map(({ name, label, max, step }) => (
          <FormField key={name} control={form.control} name={name} render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs font-bold'>{label}</FormLabel>
              <FormControl>
                <Input type='number' min={0} max={max} step={step} {...field} className='h-11' />
              </FormControl>
              {name === 'ratingAvg' && <FormDescription className='text-xs'>Từ 0 đến 5 điểm.</FormDescription>}
              <FormMessage />
            </FormItem>
          )} />
        ))}
      </FormGrid>
    </FormSection>
  </div>
);
