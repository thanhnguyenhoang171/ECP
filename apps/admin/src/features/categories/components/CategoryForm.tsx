'use client';

import React, { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '../types/category.interface';
import { categorySchema, CategoryFormValues } from '../schemas/category.schema';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/use-category-mutation';

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: CategoryFormValues;
  parentCategories?: Category[];
  id?: string;
}

export default function CategoryForm({
  onSuccess,
  initialData,
  parentCategories = [],
  id,
}: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      parentId: 'none',
      description: '',
      active: true,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: '',
        slug: '',
        parentId: 'none',
        description: '',
        active: true,
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: CategoryFormValues) {
    if (id) {
      updateMutation.mutate(
        { id, values },
        {
          onSuccess: (result) => {
            if (result.success) {
              onSuccess();
            } else if (result.message?.includes('slug')) {
              form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
            }
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: (result) => {
          if (result.success) {
            onSuccess();
          } else if (result.message?.includes('slug')) {
            form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
          }
        },
      });
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Filter out current category from parent categories to avoid circular references
  const filteredParentCategories = parentCategories.filter(
    (cat) => cat.id !== id,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs font-bold uppercase text-slate-500'>
                Tên danh mục
              </FormLabel>
              <FormControl>
                <Input placeholder='Ví dụ: iPhone' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='slug'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs font-bold uppercase text-slate-500'>
                Đường dẫn (Slug){' '}
                <span className='text-[10px] font-normal lowercase text-slate-400'>
                  (Tùy chọn)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Ví dụ: iphone' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='parentId'
          render={({ field }) => {
            // Đảm bảo giá trị luôn hợp lệ cho component Select
            // Nếu là null, undefined hoặc "" thì coi như là "none"
            const currentValue = field.value || 'none';

            return (
              <FormItem>
                <FormLabel className='text-xs font-bold uppercase text-slate-500'>
                  Danh mục cha
                </FormLabel>
                <Select onValueChange={field.onChange} value={currentValue}>
                  <FormControl>
                    <SelectTrigger className='bg-white'>
                      <SelectValue placeholder='Chọn danh mục cha' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='none' className='text-slate-400 italic'>
                      -- Không có (Danh mục gốc) --
                    </SelectItem>
                    {filteredParentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Mô tả</FormLabel>
              <FormControl>
                <textarea 
                  placeholder="Mô tả ngắn gọn về danh mục" 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='active'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border border-slate-100 p-3 shadow-sm'>
              <div className='space-y-0.5 mb-0'>
                <FormLabel className='text-xs font-bold uppercase text-slate-500'>
                  Trạng thái hoạt động
                </FormLabel>
              </div>
              <FormControl>
                <Switch
                  className='mb-0'
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-3 pt-4 border-t border-slate-100'>
          <Button
            type='button'
            variant='outline'
            onClick={onSuccess}
            disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 min-w-25'
            disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : initialData ? (
              'Cập nhật'
            ) : (
              'Tạo mới'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
