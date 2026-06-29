'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Control, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Loader2, 
  Info, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Settings2,
  X,
  Globe,
  Sparkles,
  TrendingUp,
  Coins,
  PackageCheck
} from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  AdminFormLabel
} from '@/components/common';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { useUIStore } from '@/store/uiStore';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import { 
  productSchema, 
  ProductFormValues, 
  ProductAttributeValues,
  ProductSpecificationValues
} from '../schemas/product.schema';
import { cn, convertToSlug } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface ProductFormProps {
  onSuccess: () => void;
  initialData?: ProductFormValues & { id?: string };
}



/**
 * Sub-component for managing dynamic attributes within a variant
 */
const VariantAttributes = ({ 
  control, 
  variantIndex 
}: { 
  control: Control<ProductFormValues>, 
  variantIndex: number 
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.attributes` as any,
  });

  const suggestions = ['Màu sắc', 'Dung lượng', 'Kích thước'];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Thuộc tính:</h5>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-500 transition-colors"
              onClick={() => append({ key: s, value: '' })}
            >
              + {s}
            </button>
          ))}
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-6 text-[10px] gap-1 text-blue-600 hover:bg-blue-50 px-2 self-start"
          onClick={() => append({ key: '', value: '' })}
        >
          <Plus size={10} /> Thêm thuộc tính khác
        </Button>
      </div>
      
      {fields.length === 0 && (
        <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
          Chưa cấu hình thuộc tính phân loại (Màu, Size...). Nhấp nút phía trên để thêm nhanh.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 group animate-in fade-in-30">
            <FormField
              control={control}
              name={`variants.${variantIndex}.attributes.${index}.key` as any}
              render={({ field }) => (
                <Input placeholder="Tên (vd: Màu sắc)" {...field} className="h-8 text-xs border-slate-200 focus:border-blue-500" />
              )}
            />
            <FormField
              control={control}
              name={`variants.${variantIndex}.attributes.${index}.value` as any}
              render={({ field }) => (
                <Input placeholder="Giá trị (vd: Xanh Titan)" {...field} className="h-8 text-xs border-slate-200 focus:border-blue-500" />
              )}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-300 hover:text-red-500 shrink-0"
              onClick={() => remove(index)}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const { isSidebarCollapsed } = useUIStore();
  const { data: categoriesData } = useCategories({ page: 0, size: 100 });
  const categories = categoriesData?.data || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [activeTab, setActiveTab] = useState<'general' | 'logistics' | 'variants' | 'seo'>('general');
  const isSlugEdited = useRef(false);

  // Chuyển đổi an toàn attributes từ Object Record -> Array
  const transformAttributesToArray = (attrs: Record<string, string> | any[] | undefined) => {
    if (!attrs) return [];
    if (Array.isArray(attrs)) return attrs;
    if (typeof attrs === 'object') {
      return Object.entries(attrs).map(([key, value]) => ({ key, value }));
    }
    return [];
  };

  // Chuyển đổi an toàn specifications từ Object Record -> Array
  const transformSpecificationsToArray = (specs: Record<string, string> | any[] | undefined) => {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;
    if (typeof specs === 'object') {
      return Object.entries(specs).map(([key, value]) => ({ key, value }));
    }
    return [];
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: initialData?.sku || '',
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      brand: initialData?.brand || '',
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || '',
      thumbnail: initialData?.thumbnail || '',
      images: initialData?.images || [],
      specifications: initialData?.specifications 
        ? transformSpecificationsToArray(initialData.specifications) 
        : [],
      isPublished: initialData?.isPublished !== undefined ? initialData.isPublished : true,
      weight: (initialData as any)?.weight || 0,
      length: (initialData as any)?.length || 0,
      width: (initialData as any)?.width || 0,
      height: (initialData as any)?.height || 0,
      tags: (initialData as any)?.tags || '',
      metaTitle: (initialData as any)?.metaTitle || '',
      metaDescription: (initialData as any)?.metaDescription || '',
      metaKeywords: (initialData as any)?.metaKeywords || '',
      variants: initialData?.variants?.map(v => ({
        sku: v.sku || '',
        price: v.price || 0,
        stock: v.stock || 0,
        compareAtPrice: (v as any).compareAtPrice || 0,
        costPrice: (v as any).costPrice || 0,
        barcode: (v as any).barcode || '',
        barcodeType: (v as any).barcodeType || 'EAN-13',
        image: (v as any).image || '',
        isActive: (v as any).isActive !== undefined ? (v as any).isActive : true,
        attributes: transformAttributesToArray(v.attributes)
      })) || [
        { 
          sku: '', 
          price: 0, 
          stock: 0,
          compareAtPrice: 0,
          costPrice: 0,
          barcode: '', 
          barcodeType: 'EAN-13', 
          isActive: true, 
          image: '', 
          attributes: [] 
        }
      ],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const skuValue = form.watch('sku');
  const descriptionValue = form.watch('description');
  const metaTitleValue = form.watch('metaTitle');
  const metaDescriptionValue = form.watch('metaDescription');

  // Auto-slug generator
  useEffect(() => {
    if (nameValue && !isSlugEdited.current && !initialData?.id) {
      form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, initialData]);

  // Sinh SKU hàng loạt cho tất cả các biến thể
  const handleAutoGenerateAllSkus = () => {
    const mainSku = form.getValues('sku') || 'PROD';
    variantFields.forEach((v, index) => {
      const attrs = form.getValues(`variants.${index}.attributes`) || [];
      const attrStr = attrs
        .map(a => a.value)
        .filter(Boolean)
        .map(val => convertToSlug(val).toUpperCase())
        .join('-');
      const generated = attrStr ? `${mainSku}-${attrStr}` : `${mainSku}-${index + 1}`;
      form.setValue(`variants.${index}.sku`, generated, { shouldValidate: true });
    });
  };

  async function onSubmit(values: ProductFormValues) {
    const transformToMap = (arr: {key: string, value: any}[]) => {
      return arr.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);
    };

    const payload = {
      ...values,
      specifications: transformToMap(values.specifications as any),
      variants: values.variants.map(v => ({
        ...v,
        attributes: transformToMap(v.attributes as any)
      }))
    };

    if (initialData?.id) {
      await updateMutation.mutateAsync({ id: initialData.id, values: payload as any });
    } else {
      await createMutation.mutateAsync(payload as any);
    }
    onSuccess();
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Real-time margin calculator helper component
  const MarginIndicator = ({ variantIndex }: { variantIndex: number }) => {
    const price = useWatch({ control: form.control, name: `variants.${variantIndex}.price` }) || 0;
    const costPrice = useWatch({ control: form.control, name: `variants.${variantIndex}.costPrice` }) || 0;
    const compareAtPrice = useWatch({ control: form.control, name: `variants.${variantIndex}.compareAtPrice` }) || 0;

    const profit = price - costPrice;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
    const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {costPrice > 0 && (
          <div className={cn(
            "text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1",
            profit >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          )}>
            <Coins size={10} />
            Lãi: {formatCurrency(profit)} ({margin}%)
          </div>
        )}
        {compareAtPrice > price && (
          <div className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold flex items-center gap-1">
            <TrendingUp size={10} />
            Khuyến mãi: -{discount}%
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    { id: 'logistics', label: 'Vận chuyển & Kho', icon: Layers },
    { id: 'variants', label: 'Biến thể sản phẩm', icon: Settings2 },
    { id: 'seo', label: 'Tối ưu SEO', icon: Globe },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
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
            </div>
          </div>
        )}

        {/* Tab 2: Logistics & Inventory */}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
            <div className="lg:col-span-8 space-y-6">
              <FormSection 
                title="Thông số Vận chuyển & Giao vận" 
                description="Nhập thông tin vật lý để cấu hình tự động tính phí giao hàng qua các đối tác (GHTK, GHN...)."
              >
                <FormGrid cols={2}>
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

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Khối lượng đóng gói (Gram)</AdminFormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Vd: 200" {...field} className="h-11" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Chiều dài hộp (cm)</AdminFormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Vd: 20" {...field} className="h-11" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Chiều rộng hộp (cm)</AdminFormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Vd: 15" {...field} className="h-11" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Chiều cao hộp (cm)</AdminFormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Vd: 5" {...field} className="h-11" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>
            </div>

            <div className="lg:col-span-4 space-y-6">
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

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Nhãn sản phẩm (Tags)</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: new-arrival, apple-2026, hot-deal" {...field} className="h-11" />
                        </FormControl>
                        <FormDescription className="text-[9px]">
                          Ngăn cách các thẻ bằng dấu phẩy. Giúp nhóm sản phẩm và tạo chiến dịch nhanh.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>
            </div>
          </div>
        )}

        {/* Tab 3: Variants */}
        {activeTab === 'variants' && (
          <section className="space-y-6 animate-in fade-in-30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-base font-bold text-slate-800">Biến thể phân loại kho</h3>
              </div>
              <div className="flex gap-2">
                {variantFields.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    className="gap-1.5 text-xs font-semibold text-slate-600"
                    onClick={handleAutoGenerateAllSkus}
                  >
                    <Sparkles size={13} className="text-amber-500" /> Tự sinh SKU biến thể
                  </Button>
                )}
                <Button 
                  type="button" 
                  className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100"
                  onClick={() => appendVariant({ 
                    sku: '', 
                    price: 0, 
                    stock: 0,
                    compareAtPrice: 0,
                    costPrice: 0,
                    barcode: '', 
                    barcodeType: 'EAN-13', 
                    isActive: true, 
                    image: '', 
                    attributes: [] 
                  })}
                >
                  <Plus size={14} /> Thêm biến thể mới
                </Button>
              </div>
            </div>

            {variantFields.length === 0 && (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <PackageCheck size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">Sản phẩm này chưa có biến thể nào. Bấm nút Thêm biến thể mới để khởi tạo cấu hình bán hàng.</p>
              </div>
            )}

            <div className="space-y-6">
              {variantFields.map((field, index) => (
                <Card key={field.id} className="border-slate-200/80 shadow-sm relative overflow-hidden transition-all hover:border-slate-300 rounded-2xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                  <CardHeader className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                        {index + 1}
                      </div>
                      <CardTitle className="text-xs font-bold text-slate-700 font-mono">
                        {form.watch(`variants.${index}.sku`) || `BIẾN THỂ CHƯA CÓ SKU`}
                      </CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.isActive`}
                        render={({ field }) => (
                          <div className="flex items-center gap-2 mr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hoạt động</span>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                              className="scale-75 data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        )}
                      />
                      
                      {variantFields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Upload ảnh của biến thể */}
                      <div className="lg:col-span-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.image`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <AdminFormLabel className="text-[10px]">Ảnh biến thể</AdminFormLabel>
                              <FormControl>
                                <ImageUpload 
                                  value={field.value} 
                                  onChange={field.onChange} 
                                  folder="products"
                                  className="w-full aspect-square max-w-[120px] mx-auto" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Các trường cấu hình giá, tồn kho */}
                      <div className="lg:col-span-10">
                        <FormGrid cols={4} className="gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.sku`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <AdminFormLabel>Mã SKU</AdminFormLabel>
                                  <button
                                    type="button"
                                    className="text-[9px] text-blue-600 font-bold hover:underline"
                                    onClick={() => {
                                      const main = form.getValues('sku') || 'PROD';
                                      const attrs = form.getValues(`variants.${index}.attributes`) || [];
                                      const attrStr = attrs
                                        .map(a => a.value)
                                        .filter(Boolean)
                                        .map(v => convertToSlug(v).toUpperCase())
                                        .join('-');
                                      form.setValue(`variants.${index}.sku`, attrStr ? `${main}-${attrStr}` : main, { shouldValidate: true });
                                    }}
                                  >
                                    Tự sinh
                                  </button>
                                </div>
                                <FormControl>
                                  <Input placeholder="Vd: IP15-TITAN-256" {...field} className="h-9 font-mono text-xs uppercase" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel required>Giá bán (đ)</AdminFormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    className="h-9 text-xs font-bold text-blue-600 focus:border-blue-500" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.compareAtPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Giá so sánh/Giá gốc (đ)</AdminFormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    className="h-9 text-xs text-slate-500 line-through" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.costPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Giá vốn nhập (đ)</AdminFormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    className="h-9 text-xs text-slate-700" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel required>Số lượng tồn kho</AdminFormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={e => field.onChange(Number(e.target.value))}
                                    className="h-9 text-xs font-semibold" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.barcode`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <AdminFormLabel>Mã vạch (Barcode)</AdminFormLabel>
                                <FormControl>
                                  <Input placeholder="Vd: 8931234567890" {...field} className="h-9 text-xs font-mono" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.barcodeType`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Loại Barcode</AdminFormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="EAN-13">EAN-13</SelectItem>
                                    <SelectItem value="UPC-A">UPC-A</SelectItem>
                                    <SelectItem value="CODE-128">CODE-128</SelectItem>
                                    <SelectItem value="QR-CODE">QR CODE</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </FormGrid>

                        {/* Tính Biên lợi nhuận & Giảm giá thời gian thực */}
                        <MarginIndicator variantIndex={index} />
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <VariantAttributes control={form.control} variantIndex={index} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Tab 4: SEO */}
        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
            <div className="lg:col-span-8 space-y-6">
              <FormSection 
                title="Tối ưu SEO cho sản phẩm" 
                description="Giúp sản phẩm đạt thứ hạng cao trên các công cụ tìm kiếm phổ biến."
              >
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Meta Title (Tiêu đề SEO)</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tiêu đề hiển thị trên Google" {...field} className="h-11 border-slate-200" />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Độ dài khuyến nghị 50-60 ký tự. Để trống sẽ dùng tên sản phẩm làm mặc định.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Meta Description (Mô tả SEO)</AdminFormLabel>
                        <FormControl>
                          <textarea 
                            placeholder="Nhập đoạn giới thiệu sản phẩm khi xuất hiện trên kết quả Google..." 
                            className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Độ dài khuyến nghị 150-160 ký tự. Nhập ngắn gọn, kích thích người mua bấm vào link.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFormLabel>Từ khóa liên quan (Keywords)</AdminFormLabel>
                        <FormControl>
                          <Input placeholder="Vd: dien thoai iphone 15, apple smartphone, mua iphone o dau" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Google Snippet Preview */}
                  <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
                      <Globe size={13} className="text-blue-500" />
                      <span>Xem trước kết quả tìm kiếm Google</span>
                    </div>
                    <div className="space-y-1 select-none">
                      <div className="text-[15px] font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate max-w-full leading-tight">
                        {metaTitleValue || nameValue || 'Tiêu đề sản phẩm hiển thị trên Google'}
                      </div>
                      <div className="text-[12px] text-[#006621] truncate leading-tight font-mono">
                        https://ecp-store.com/products/{slugValue || 'duong-dan-san-pham'}
                      </div>
                      <div className="text-[12px] text-[#545454] line-clamp-2 leading-relaxed">
                        {metaDescriptionValue || descriptionValue || 'Nhập mô tả SEO hoặc mô tả chi tiết sản phẩm để hiển thị tóm tắt này trên kết quả tìm kiếm của Google giúp nâng cao tỷ lệ nhấp chuột...'}
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          </div>
        )}

        {/* Sticky Actions Bar */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3.5 z-50 shadow-lg transition-all duration-200",
          isSidebarCollapsed ? "lg:left-20" : "lg:left-64"
        )}>
          <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Trang thiết lập: {tabs.find(t => t.id === activeTab)?.label}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Button type="button" variant="ghost" onClick={onSuccess} className="font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100" disabled={isLoading}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-10 font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-200" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {initialData?.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

