'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Layers, Loader2 } from 'lucide-react';

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
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { productSchema, ProductFormValues } from '../schemas/product.schema';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import { useCategories } from '@/features/categories/hooks/use-categories';

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Tên sản phẩm</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: iPhone 15 Pro Max" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Mã sản phẩm (SKU Gốc)</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: IP15PM-TITAN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Thương hiệu</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-slate-500">Danh mục</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
        </div>

        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm bg-slate-50/30">
          <div className="space-y-0.5">
            <FormLabel className="text-xs font-bold uppercase text-slate-500">Hiển thị bán hàng</FormLabel>
            <div className="text-[11px] text-slate-400">Cho phép sản phẩm này hiển thị trên cửa hàng</div>
          </div>
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase">Danh sách biến thể</h3>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-8 text-[10px] font-bold"
              onClick={() => append({ sku: '', price: 0, stock: 0, attributes: {} })}
            >
              <Plus size={14} className="mr-1" /> Thêm biến thể
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-slate-100 shadow-none bg-slate-50/50 relative overflow-hidden">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold text-slate-400">SKU BIẾN THỂ</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU" {...field} className="h-8 text-xs" />
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
                          <FormLabel className="text-[10px] font-bold text-slate-400">GIÁ BÁN</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Giá" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="h-8 text-xs" 
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
                          <FormLabel className="text-[10px] font-bold text-slate-400">TỒN KHO</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Số lượng" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              className="h-8 text-xs" 
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
                      className="absolute top-2 right-2 h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
          <Button type="button" variant="outline" onClick={onSuccess}>Hủy</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

