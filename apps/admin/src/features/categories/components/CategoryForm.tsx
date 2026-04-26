'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categorySchema, CategoryFormValues } from '../schemas/category.schema';
import { useCreateCategory, useUpdateCategory } from '../hooks/use-category-mutation';

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: CategoryFormValues;
  parentCategories?: any[];
  id?: string;
}

export default function CategoryForm({ onSuccess, initialData, parentCategories = [], id }: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      parentId: '',
      description: '',
      active: true,
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    if (id) {
      updateMutation.mutate({ id, values }, {
        onSuccess: (result) => {
          if (result.success) {
            onSuccess();
          } else if (result.message?.includes('slug')) {
            form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
          }
        }
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: (result) => {
          if (result.success) {
            onSuccess();
          } else if (result.message?.includes('slug')) {
            form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
          }
        }
      });
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Tên danh mục</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: iPhone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Đường dẫn (Slug)</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: iphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Danh mục cha</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Chọn danh mục cha (Bỏ trống nếu là gốc)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none" className="text-slate-400 italic">-- Không có (Danh mục gốc) --</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-slate-500">Mô tả</FormLabel>
              <FormControl>
                <Input placeholder="Mô tả ngắn gọn về danh mục" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isSubmitting}>Hủy</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-25" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (initialData ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
