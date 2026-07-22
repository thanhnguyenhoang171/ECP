'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ImageUpload,
  FormSection,
  FormGrid,
  AdminFormLabel,
} from '@/components/common';
import { ProductFormValues } from '../../schemas/product.schema';
import { Category } from '@/features/categories/types/category.interface';
import { convertToSlug } from '@/lib/utils';

interface ProductGeneralTabProps {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  isSlugEdited: React.MutableRefObject<boolean>;
  nameValue: string;
}

export const ProductGeneralTab = ({ form, categories, isSlugEdited, nameValue }: ProductGeneralTabProps) => {
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
      <div className="lg:col-span-8 space-y-6">
        <FormSection 
          title="Thông tin cơ bản" 
          description="Các thông tin định danh chính của sản phẩm."
        >
          <FormGrid cols={2}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <AdminFormLabel required>Tên sản phẩm</AdminFormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: iPhone 15 Pro Max" {...field} className="h-11 border-slate-200 focus:border-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <AdminFormLabel required>Thương hiệu</AdminFormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Apple" {...field} className="h-11" />
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
                  <div className="flex items-center justify-between">
                    <AdminFormLabel>Đường dẫn (Slug)</AdminFormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-[10px] text-blue-600 font-bold"
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
                        placeholder="iphone-15-pro-max" 
                        {...field} 
                        className="h-11 bg-slate-50/50 font-mono text-xs pr-16 border-slate-200" 
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
              name="sku"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <AdminFormLabel required>Mã SKU chính của sản phẩm (Parent SKU)</AdminFormLabel>
                  <FormControl>
                    <Input placeholder="Vd: IP15PM-PARENT" {...field} className="h-11 font-mono uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormSection 
          title="Mô tả chi tiết" 
          description="Giới thiệu tính năng, cấu hình và lợi ích sản phẩm."
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <textarea 
                    placeholder="Nhập mô tả chi tiết sản phẩm chuẩn SEO..." 
                    className="flex min-h-[160px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection 
          title="Thông số kỹ thuật sản phẩm" 
          description="Các đặc tính kỹ thuật định dạng Key-Value (ví dụ: RAM, ROM, Pin...)"
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="gap-2 text-xs"
                onClick={() => appendSpec({ key: '', value: '' })}
              >
                <Plus size={14} /> Thêm thông số
              </Button>
            </div>

            {specFields.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">Chưa thiết lập thông số kỹ thuật nào.</p>
              </div>
            ) : (
              <FormGrid cols={2}>
                {specFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-1 col-span-1">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.key`}
                        render={({ field }) => (
                          <Input placeholder="Tên (vd: Bộ nhớ)" {...field} className="h-10" />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.value`}
                        render={({ field }) => (
                          <Input placeholder="Giá trị (vd: 256GB)" {...field} className="h-10" />
                        )}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-300 hover:text-red-500 shrink-0"
                      onClick={() => removeSpec(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </FormGrid>
            )}
          </div>
        </FormSection>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <FormSection title="Phân loại Danh mục">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <AdminFormLabel required>Danh mục chính</AdminFormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-slate-200">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Hình ảnh đại diện (Thumbnail)">
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload 
                    value={field.value} 
                    onChange={field.onChange}
                    folder="products"
                    className="w-full aspect-square max-w-[200px] mx-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Bộ sưu tập hình ảnh (Gallery)">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload 
                    multiple 
                    maxFiles={5}
                    value={field.value} 
                    onChange={field.onChange}
                    folder="products"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Trạng thái & Gắn thẻ">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="flex flex-col gap-0.5">
                    <AdminFormLabel className="mb-0">Trạng thái bán</AdminFormLabel>
                    <span className="text-[10px] text-slate-400">Hiển thị sản phẩm lên cửa hàng.</span>
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
  );
};
