'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Globe, Eye, Settings, Image as ImageIcon, Layers } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

import { 
  ImageUpload, 
  FormSection, 
  FormGrid, 
  AdminFormLabel 
} from '@/components/common';

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: CategoryFormValues;
  parentCategories?: Category[];
  id?: string;
}

const convertToSlug = (str: string) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/[^a-z0-9 -]/g, ""); // remove invalid chars
  str = str.replace(/\s+/g, "-"); // collapse whitespace and replace by -
  str = str.replace(/-+/g, "-"); // collapse dashes
  str = str.replace(/^-+/, ""); // trim - from start
  str = str.replace(/-+$/, ""); // trim - from end
  return str;
};

export default function CategoryForm({
  onSuccess,
  initialData,
  parentCategories = [],
  id,
}: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isSlugEdited = useRef(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      parentId: '',
      active: true,
      thumbnail: undefined,
      description: '',
      displayOrder: 0,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const metaTitleValue = form.watch('metaTitle');
  const metaDescriptionValue = form.watch('metaDescription');
  const descriptionValue = form.watch('description');

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        parentId: initialData.parentId || '',
        thumbnail: initialData.thumbnail,
        description: initialData.description || '',
        displayOrder: initialData.displayOrder || 0,
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        metaKeywords: initialData.metaKeywords || '',
      });
      isSlugEdited.current = !!initialData.slug;
    } else {
      form.reset({
        name: '',
        slug: '',
        parentId: '',
        active: true,
        thumbnail: undefined,
        description: '',
        displayOrder: 0,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
      });
      isSlugEdited.current = false;
    }
  }, [initialData, form]);

  // Auto slug generation logic
  useEffect(() => {
    if (nameValue && !isSlugEdited.current && !id) {
      form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, id]);

  async function onSubmit(values: CategoryFormValues) {
    const payload = {
      ...values,
      parentId: (values.parentId === '' || values.parentId === 'none') ? null : values.parentId
    };

    if (id) {
      updateMutation.mutate(
        { id, values: payload as any },
        {
          onSuccess: (result) => {
            if (result.success) {
              onSuccess();
            } else if ((result as any).message?.includes('slug')) {
              form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
            }
          },
        },
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: (result) => {
          if (result.success) {
            onSuccess();
          } else if ((result as any).message?.includes('slug')) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pt-2 pb-6'>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Thông tin chính và SEO (8 cột) */}
          <div className="lg:col-span-8 space-y-6">
            <FormSection 
              title="Thông tin cơ bản" 
              description="Nhập các thông tin định danh chính của danh mục."
            >
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <AdminFormLabel required>Tên danh mục</AdminFormLabel>
                      <FormControl>
                        <Input 
                          placeholder='Ví dụ: iPhone, Phụ kiện, v.v.' 
                          className="h-11 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <AdminFormLabel>Đường dẫn (Slug)</AdminFormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-auto p-0 text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          onClick={() => {
                            isSlugEdited.current = false;
                            form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
                          }}
                        >
                          Sinh tự động
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            placeholder='Ví dụ: iphone-15-series' 
                            className="h-11 bg-slate-50/50 font-mono text-xs pr-16 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            {...field} 
                            onChange={(e) => {
                              isSlugEdited.current = true;
                              field.onChange(e);
                            }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded tracking-wider">
                            {isSlugEdited.current ? 'CUSTOM' : 'AUTO'}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <AdminFormLabel>Mô tả chi tiết</AdminFormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Mô tả tóm tắt về danh mục này giúp hiển thị trên website..."
                          className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            {/* Khối quản lý SEO */}
            <FormSection
              title="Tối ưu SEO (Search Engine Optimization)"
              description="Thiết lập các thẻ siêu dữ liệu để danh mục hiển thị tốt hơn trên Google."
            >
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name='metaTitle'
                  render={({ field }) => (
                    <FormItem>
                      <AdminFormLabel>Meta Title (Tiêu đề SEO)</AdminFormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nhập tiêu đề SEO (khuyến nghị dưới 60 ký tự)" 
                          className="h-10 border-slate-200 focus:border-blue-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        Nếu để trống, hệ thống sẽ sử dụng Tên danh mục làm tiêu đề SEO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='metaDescription'
                  render={({ field }) => (
                    <FormItem>
                      <AdminFormLabel>Meta Description (Mô tả SEO)</AdminFormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Nhập mô tả SEO (khuyến nghị dưới 160 ký tự)"
                          className="flex min-h-[70px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='metaKeywords'
                  render={({ field }) => (
                    <FormItem>
                      <AdminFormLabel>Từ khóa SEO (Keywords)</AdminFormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ví dụ: apple, iphone, phu kien,..." 
                          className="h-10 border-slate-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Google Snippet Live Preview */}
                <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                    <Globe size={13} className="text-blue-500" />
                    <span>Xem trước hiển thị trên Google</span>
                  </div>
                  <div className="space-y-1 select-none">
                    <div className="text-[15px] font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate max-w-full leading-tight">
                      {metaTitleValue || nameValue || 'Tiêu đề trang hiển thị trên Google'}
                    </div>
                    <div className="text-[12px] text-[#006621] truncate leading-tight">
                      https://ecp-store.com/categories/{slugValue || 'duong-dan-danh-muc'}
                    </div>
                    <div className="text-[12px] text-[#545454] line-clamp-2 leading-relaxed">
                      {metaDescriptionValue || descriptionValue || 'Nhập mô tả SEO hoặc mô tả danh mục để hiển thị thông tin giới thiệu tóm tắt này trên kết quả tìm kiếm của Google...'}
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>
          </div>

          {/* Cột phải: Trạng thái & Phân loại & Ảnh (4 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <FormSection 
              title="Phân loại & Hiển thị"
              description="Cấu hình danh mục cha và độ ưu tiên hiển thị."
            >
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name='parentId'
                  render={({ field }) => (
                    <FormItem>
                      <AdminFormLabel>Danh mục cha</AdminFormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger className='h-11 bg-white border-slate-200'>
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
                  )}
                />

                <FormField
                  control={form.control}
                  name='displayOrder'
                  render={({ field }) => (
                    <FormItem>
                      <AdminFormLabel>Thứ tự hiển thị (Display Order)</AdminFormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Số nhỏ hiển thị trước (Vd: 0, 1, 2...)"
                          className="h-11 border-slate-200"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormItem className='flex flex-row items-center justify-between rounded-xl border border-slate-200/60 p-4 bg-slate-50/50 h-14'>
                      <div className="flex flex-col gap-0.5">
                        <AdminFormLabel className="mb-0 cursor-pointer">Kích hoạt danh mục</AdminFormLabel>
                        <span className="text-[10px] text-slate-400">Cho phép hiển thị ngoài Storefront.</span>
                      </div>
                      <FormControl>
                        <Switch
                          className='mb-0 scale-90 data-[state=checked]:bg-blue-600'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection 
              title="Hình ảnh" 
              description="Ảnh đại diện danh mục."
            >
              <FormField
                control={form.control}
                name='thumbnail'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        description="Ảnh danh mục"
                        className="w-full aspect-square max-w-[180px] mx-auto"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
                      Sử dụng định dạng JPG, PNG hoặc WebP. Khuyến nghị tỷ lệ 1:1.
                    </p>
                  </FormItem>
                )}
              />
            </FormSection>
          </div>
        </div>

        {/* Buttons thao tác */}
        <div className='flex justify-end gap-3 pt-6 border-t border-slate-100'>
          <Button
            type='button'
            variant='ghost'
            onClick={onSuccess}
            className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
            disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 min-w-36 shadow-lg shadow-blue-200 h-11 font-bold text-xs uppercase tracking-widest'
            disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : null}
            {isSubmitting ? 'Đang xử lý...' : id ? 'Cập nhật danh mục' : 'Tạo danh mục'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

