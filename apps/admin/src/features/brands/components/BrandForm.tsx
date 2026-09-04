'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandSchema, BrandFormValues } from '../schemas/brand.schema';
import { useCreateBrand, useUpdateBrand } from '../hooks/use-brand-mutation';
import { Brand } from '../types/brand.interface';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  FormSection, 
  FormGrid, 
  AdminFormLabel, 
  ImageUpload, 
  FormActionsBar 
} from '@/components/common';
import { cn, convertToSlug } from '@/lib/utils';

interface BrandFormProps {
  initialData?: Brand | null;
  id?: string;
  onSuccess: () => void;
  isDialog?: boolean;
  isLoadingData?: boolean;
}

export default function BrandForm({ initialData, id, onSuccess, isDialog = false, isLoadingData = false }: BrandFormProps) {
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const isSlugEditedRef = useRef(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const brandId = id || initialData?.id;

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      logo: initialData?.logo || '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      active: initialData?.active ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        slug: initialData.slug || '',
        logo: initialData.logo || '',
        description: initialData.description || '',
        website: initialData.website || '',
        active: initialData.active ?? true,
      });
    }
  }, [initialData, form]);

  const nameValue = useWatch({ control: form.control, name: 'name' });
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: BrandFormValues) => {
    if (isImageUploading) {
      toast.warning('Ảnh đang được tải lên cloud, vui lòng chờ trong giây lát!');
      return;
    }

    if (brandId) {
      await updateMutation.mutateAsync({ id: brandId, values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}
      >
        <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30", isDialog ? "flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2" : "")}>
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-6">
            <FormSection 
              title="Thông tin cơ bản" 
              description="Các thông tin định danh chính của thương hiệu."
            >
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <AdminFormLabel required>Tên thương hiệu</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <Input
                            placeholder="Ví dụ: ChaTraMue, Bento, Lay's Thailand, Koh-Kae..."
                            {...field}
                            className="h-11 border-slate-200 focus:border-blue-500"
                            onChange={(e) => {
                              field.onChange(e);
                              if (!isSlugEditedRef.current) {
                                form.setValue('slug', convertToSlug(e.target.value), { shouldValidate: true });
                              }
                            }}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="flex items-center justify-between">
                        <AdminFormLabel>Đường dẫn (Slug)</AdminFormLabel>
                        {!isLoadingData && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto p-0 text-[10px] text-blue-600 font-bold"
                            onClick={() => {
                              isSlugEditedRef.current = false;
                              form.setValue('slug', convertToSlug(nameValue || ''), { shouldValidate: true });
                            }}
                          >
                            Sinh tự động
                          </Button>
                        )}
                      </div>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <div className="relative group">
                            <Input 
                              placeholder="chatramue" 
                              {...field} 
                              className="h-11 bg-slate-50/50 font-mono text-xs pr-16 border-slate-200" 
                              onChange={(e) => {
                                isSlugEditedRef.current = true;
                                field.onChange(e);
                              }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded tracking-wider">
                              {isSlugEditedRef.current ? 'CUSTOM' : 'AUTO'}
                            </div>
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <AdminFormLabel>Website chính thức</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-11 w-full rounded-xl" />
                        ) : (
                          <Input placeholder="https://www.cacaoshop.com" {...field} className="h-11 border-slate-200" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <AdminFormLabel>Mô tả thương hiệu</AdminFormLabel>
                      <FormControl>
                        {isLoadingData ? (
                          <Skeleton className="h-[120px] w-full rounded-xl" />
                        ) : (
                          <textarea
                            placeholder="Nhập giới thiệu tóm tắt về thương hiệu..."
                            className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                            {...field}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            <FormSection title="Logo thương hiệu">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {isLoadingData ? (
                        <Skeleton className="w-full aspect-square max-w-[200px] mx-auto rounded-2xl" />
                      ) : (
                        <ImageUpload 
                          value={field.value} 
                          onChange={field.onChange}
                          onUploadingChange={setIsImageUploading}
                          folder="brands"
                          reqWidth={128}
                          reqHeight={128}
                          className="w-full aspect-square max-w-[200px] mx-auto"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Trạng thái">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                    <div className="flex flex-col gap-0.5">
                      <AdminFormLabel className="mb-0 cursor-pointer">Trạng thái hoạt động</AdminFormLabel>
                      <span className="text-[10px] text-slate-400">Cho phép hiển thị thương hiệu ở cửa hàng.</span>
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
            </FormSection>
          </div>
        </div>

        {/* Sticky Form Actions Bar */}
        <FormActionsBar
          onCancel={onSuccess}
          isSubmitting={isLoading || isImageUploading}
          submitText={isImageUploading ? 'Đang tải ảnh lên...' : (brandId ? 'Cập nhật thương hiệu' : 'Lưu thương hiệu')}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
