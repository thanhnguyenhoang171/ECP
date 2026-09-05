'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Globe, Info } from 'lucide-react';

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
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/constants/errorMessages';

import { 
  ImageUpload, 
  FormSection, 
  FormGrid, 
  AdminFormLabel,
  FormActionsBar
} from '@/components/common';
import { cn, convertToSlug } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: CategoryFormValues;
  parentCategories?: Category[];
  id?: string;
  isDialog?: boolean;
  isParentLocked?: boolean;
}

export default function CategoryForm({
  onSuccess,
  initialData,
  parentCategories = [],
  id,
  isDialog = false,
  isParentLocked = false,
}: CategoryFormProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isSlugEdited = useRef(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const defaultFormValues: CategoryFormValues = {
    name: '',
    slug: '',
    parentId: '',
    active: true,
    isFeatured: false,
    imageUrl: undefined,
    imagePublicId: undefined,
    description: '',
    order: 0,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...defaultFormValues,
      ...(initialData || {}),
      parentId: initialData?.parentId || '',
    },
  });

  const nameValue = useWatch({ control: form.control, name: 'name' });
  const slugValue = useWatch({ control: form.control, name: 'slug' });
  const metaTitleValue = useWatch({ control: form.control, name: 'metaTitle' });
  const metaDescriptionValue = useWatch({ control: form.control, name: 'metaDescription' });
  const descriptionValue = useWatch({ control: form.control, name: 'description' });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        parentId: initialData.parentId || '',
        imageUrl: initialData.imageUrl,
        imagePublicId: initialData.imagePublicId,
        description: initialData.description || '',
        order: initialData.order || 0,
        sortOrder: initialData.sortOrder ?? initialData.order ?? 0,
        isFeatured: initialData.isFeatured ?? false,
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
        isFeatured: false,
        imageUrl: undefined,
        imagePublicId: undefined,
        description: '',
        order: 0,
        sortOrder: 0,
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
    if (isImageUploading) {
      toast.warning('Ảnh đang được tải lên cloud, vui lòng chờ trong giây lát!');
      return;
    }

    const payload = {
      ...values,
      parentId: (values.parentId === '' || values.parentId === 'none') ? null : values.parentId
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ id, values: payload as any });
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      onSuccess();
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'CATEGORY_SLUG_EXISTS' || (error as Error)?.message?.includes('slug')) {
        form.setError('slug', { message: 'Đường dẫn (Slug) đã tồn tại' });
      } else {
        const msg = getApiErrorMessage(error, 'Có lỗi xảy ra khi lưu danh mục');
        toast.error(msg, { id: msg });
      }
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Filter out current category from parent categories to avoid circular references
  const filteredParentCategories = parentCategories.filter(
    (cat: Category) => cat.id !== id,
  );
  const { isSidebarCollapsed } = useUIStore();
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    // { id: 'seo', label: 'Tối ưu SEO', icon: Globe },
  ];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", isDialog ? "pb-2" : "pb-24")}>
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px scrollbar-none bg-slate-50/50 p-1.5 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                )}
              >
                <Icon size={14} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
            {/* Cột trái: Thông tin chính (8 cột) */}
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
                            className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>

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
                        <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={isParentLocked}>
                          <FormControl>
                            <SelectTrigger className='h-11 bg-white border-slate-200 disabled:opacity-80 disabled:bg-slate-100'>
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
                    name='order'
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Thứ tự hiển thị (Display Order)</AdminFormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Số nhỏ hiển thị trước (Vd: 0, 1, 2...)"
                            className="h-11 border-slate-200"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sortOrder'
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Thứ tự sắp xếp (Sort Order)</AdminFormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Vd: 0, 1, 2..."
                            className="h-11 border-slate-200"
                            {...field}
                            value={field.value ?? 0}
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

                  <FormField
                    control={form.control}
                    name='isFeatured'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-xl border border-slate-200/60 p-4 bg-amber-50/40 h-14'>
                        <div className="flex flex-col gap-0.5">
                          <AdminFormLabel className="mb-0 cursor-pointer text-amber-900 font-bold">Danh mục nổi bật</AdminFormLabel>
                          <span className="text-[10px] text-amber-700/80">Đánh dấu để Home hiển thị &quot;Danh mục nổi bật&quot;.</span>
                        </div>
                        <FormControl>
                          <Switch
                            className='mb-0 scale-90 data-[state=checked]:bg-amber-500'
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
            </div>

            {/* Cột phải: Hình ảnh (4 cột) */}
            <div className="lg:col-span-4 space-y-6">
              <FormSection title="Hình ảnh danh mục">
                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          onUploadingChange={setIsImageUploading}
                          folder="categories"
                          reqWidth={128}
                          reqHeight={128}
                          className="w-full aspect-square max-w-[200px] mx-auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </div>
          </div>
        )}

        {/* Tab 3: SEO */}
        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
            <div className="lg:col-span-8 space-y-6">
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
                            className="h-11 border-slate-200 focus:border-blue-500" 
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
                            className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
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
                            placeholder="Ví dụ: bento, snack thai, tra sua chatramue,..." 
                            className="h-11 border-slate-200" 
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
                      <div className="text-[12px] text-[#006621] truncate leading-tight font-mono">
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
          </div>
        )}

        {/* Actions Bar */}
        <FormActionsBar
          onCancel={onSuccess}
          isSubmitting={isLoading || isImageUploading}
          submitText={isImageUploading ? 'Đang tải ảnh lên...' : (id ? 'Cập nhật danh mục' : 'Lưu danh mục')}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}

