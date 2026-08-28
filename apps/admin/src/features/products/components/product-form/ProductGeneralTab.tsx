'use client';

import React, { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, ChevronDown, Check, Search } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { 
  ImageUpload,
  FormSection,
  FormGrid,
  AdminFormLabel,
} from '@/components/common';
import { ProductFormValues } from '../../schemas/product.schema';
import { Category } from '@/features/categories/types/category.interface';
import { Brand } from '@/features/brands/types/brand.interface';
import { useCreateBrand } from '@/features/brands/hooks/use-brand-mutation';
import { cn, convertToSlug, convertToSku } from '@/lib/utils';

const CreatableBrandSelect = ({
  value,
  onChange,
  brands,
}: {
  value?: string;
  onChange: (brandId: string, brandName: string) => void;
  brands: Brand[];
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const createBrandMutation = useCreateBrand();

  const selectedBrand = brands.find((b) => b.id === value);
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );
  const isExactMatch = brands.some(
    (b) => b.name.toLowerCase() === search.trim().toLowerCase()
  );

  const handleCreateNewBrand = async () => {
    if (!search.trim()) return;
    try {
      const res = await createBrandMutation.mutateAsync({
        name: search.trim(),
        active: true,
      });
      if (res.data) {
        onChange(res.data.id, res.data.name);
        setOpen(false);
        setSearch('');
      }
    } catch (e) {
      // Error is handled in mutation toast
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full h-11 justify-between bg-white border-slate-200 text-left font-normal"
        >
          {selectedBrand ? (
            <span className="truncate font-medium text-slate-900">{selectedBrand.name}</span>
          ) : (
            <span className="text-slate-400">Chọn hoặc nhập tên thương hiệu...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2" align="start">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Tìm hoặc nhập tên mới..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
            {filteredBrands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-xs rounded-md flex items-center justify-between transition-colors",
                  brand.id === value ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-100 text-slate-700"
                )}
                onClick={() => {
                  onChange(brand.id, brand.name);
                  setOpen(false);
                }}
              >
                <span>{brand.name}</span>
                {brand.id === value && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
            ))}

            {filteredBrands.length === 0 && !isExactMatch && search.trim() === '' && (
              <div className="p-3 text-center text-xs text-slate-400">
                Chưa có thương hiệu nào.
              </div>
            )}

            {search.trim() !== '' && !isExactMatch && (
              <button
                type="button"
                disabled={createBrandMutation.isPending}
                className="w-full text-left px-3 py-2 text-xs rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-2 border border-blue-200 transition-colors"
                onClick={handleCreateNewBrand}
              >
                <Plus className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {createBrandMutation.isPending ? 'Đang tạo...' : `Tạo mới thương hiệu "${search.trim()}"`}
                </span>
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ProductGeneralTabProps {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  brands?: Brand[];
  isSlugEditedRef: React.MutableRefObject<boolean>;
  nameValue: string;
  onUploadingChange?: (isUploading: boolean) => void;
}

export const ProductGeneralTab = ({ form, categories, brands = [], isSlugEditedRef, nameValue, onUploadingChange }: ProductGeneralTabProps) => {
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
                    <Input placeholder="Ví dụ: Mực Sấy Bento Thái Lan Vị Cay Ngọt 20g" {...field} className="h-11 border-slate-200 focus:border-blue-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <AdminFormLabel>Thương hiệu</AdminFormLabel>
                  <FormControl>
                    <CreatableBrandSelect
                      value={field.value}
                      brands={brands}
                      onChange={(brandId, brandName) => {
                        field.onChange(brandId);
                        form.setValue('brand', brandName, { shouldValidate: true });
                      }}
                    />
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
                        isSlugEditedRef.current = false;
                        form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
                      }}
                    >
                      Sinh tự động
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        placeholder="muc-sot-bento-thai-lan-20g" 
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
                  <div className="flex items-center justify-between">
                    <AdminFormLabel>Mã SKU chính của sản phẩm (Parent SKU)</AdminFormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-[10px] text-blue-600 font-bold"
                      onClick={() => {
                        const generatedSku = convertToSku(nameValue);
                        form.setValue('sku', generatedSku, { shouldValidate: true });
                      }}
                    >
                      Sinh tự động
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Tự động tạo (Ví dụ: BENTO-20G-RED) hoặc nhập tùy chỉnh" 
                      {...field} 
                      className="h-11 font-mono uppercase border-slate-200 focus:border-blue-500" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormSection 
          title="Mô tả chi tiết" 
          description="Giới thiệu tính năng, thành phần và hương vị sản phẩm."
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
          title="Thông tin chi tiết & Quy cách" 
          description="Các thông tin sản phẩm định dạng Key-Value (ví dụ: Xuất xứ, Trọng lượng, Hạn sử dụng, Hương vị...)"
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
                <p className="text-xs text-slate-400">Chưa thiết lập thông tin chi tiết nào.</p>
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
                          <Input placeholder="Tên (vd: Xuất xứ)" {...field} className="h-10" />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.value`}
                        render={({ field }) => (
                          <Input placeholder="Giá trị (vd: Thái Lan)" {...field} className="h-10" />
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
                    value={typeof field.value === 'string' || (typeof window !== 'undefined' && field.value instanceof File) ? field.value : (field.value as { url?: string })?.url} 
                    onChange={field.onChange}
                    onUploadingChange={onUploadingChange}
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
                    value={Array.isArray(field.value) ? field.value.map((v) => (typeof v === 'string' || (typeof window !== 'undefined' && v instanceof File) ? v : (v as { url?: string })?.url || '')).filter(Boolean) : []} 
                    onChange={field.onChange}
                    onUploadingChange={onUploadingChange}
                    folder="products"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Trạng thái & Gắn thẻ">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="flex flex-col gap-0.5">
                    <AdminFormLabel className="mb-0 cursor-pointer">Trạng thái bán</AdminFormLabel>
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

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-amber-200/60 p-4 bg-amber-50/40">
                  <div className="flex flex-col gap-0.5">
                    <AdminFormLabel className="mb-0 cursor-pointer text-amber-900 font-bold">Sản phẩm nổi bật (Featured)</AdminFormLabel>
                    <span className="text-[10px] text-amber-700/80">Hiển thị tại khu vực Sản phẩm nổi bật.</span>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="scale-90 data-[state=checked]:bg-amber-500"
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
