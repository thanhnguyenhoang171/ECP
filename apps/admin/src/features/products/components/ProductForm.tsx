'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Layers, Loader2, Info, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { productSchema, ProductFormValues } from '../schemas/product.schema';

interface ProductFormProps {
  onSuccess: () => void;
  initialData?: ProductFormValues & { id?: string };
}

export default function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const { data: categoriesData } = useCategories({ page: 0, size: 100 });
  const categories = categoriesData?.data || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      sku: '',
      name: '',
      slug: '',
      brand: '',
      categoryId: '',
      description: '',
      isPublished: true,
      variants: [
        { sku: '', price: 0, stock: 0, attributes: {} }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  async function onSubmit(values: ProductFormValues) {
    if (initialData?.id) {
      await updateMutation.mutateAsync({ id: initialData.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onSuccess();
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info size={18} className="text-primary" />
                  Thông tin cơ bản
                </CardTitle>
                <CardDescription>Các thông tin hiển thị chính của sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tên sản phẩm <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: iPhone 15 Pro Max" {...field} className="h-10 border-slate-200 focus:border-primary focus:ring-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mã SKU Gốc <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: IP15PM-TITAN" {...field} className="h-10 border-slate-200" />
                        </FormControl>
                        <FormDescription className="text-[10px]">Mã định danh duy nhất cho sản phẩm cơ bản.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">Thương hiệu</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Apple" {...field} className="h-10 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mô tả sản phẩm</FormLabel>
                      <FormControl>
                        <textarea 
                          placeholder="Nhập mô tả chi tiết về sản phẩm..." 
                          className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Variants Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" />
                    Biến thể sản phẩm
                  </CardTitle>
                  <CardDescription>Quản lý các lựa chọn như màu sắc, dung lượng...</CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 border-primary text-primary hover:bg-primary/5"
                  onClick={() => append({ sku: '', price: 0, stock: 0, attributes: {} })}
                >
                  <Plus size={14} /> Thêm biến thể
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã SKU Biến thể</FormLabel>
                              <FormControl>
                                <Input placeholder="Vd: IP15-W-128" {...field} className="h-9 border-slate-200 text-xs" />
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
                              <FormLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giá bán (VND)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(Number(e.target.value))}
                                  className="h-9 border-slate-200 text-xs text-right font-medium" 
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
                              <FormLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tồn kho ban đầu</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(Number(e.target.value))}
                                  className="h-9 border-slate-200 text-xs text-center" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Organization Card */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Tag size={16} className="text-indigo-500" />
                  Phân loại
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500">Danh mục sản phẩm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-slate-200">
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

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">Trạng thái bán</FormLabel>
                        <FormDescription className="text-[10px]">Công khai trên cửa hàng</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Quick Stats/Info Card */}
            <Card className="shadow-sm border-slate-200 bg-blue-50/30 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Kiểm tra tính hợp lệ</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Đảm bảo tất cả mã SKU là duy nhất để tránh xung đột trong hệ thống quản lý kho.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <AlertCircle size={14} />
            <span className="text-[11px] font-medium">Các trường đánh dấu * là bắt buộc</span>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button type="button" variant="outline" onClick={onSuccess} className="flex-1 md:flex-none">Hủy</Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 px-8 shadow-lg shadow-primary/20 flex-1 md:flex-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : initialData?.id ? (
                'Cập nhật sản phẩm'
              ) : (
                'Lưu sản phẩm'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

