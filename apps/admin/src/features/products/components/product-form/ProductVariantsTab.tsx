'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Sparkles, PackageCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  FormGrid,
  AdminFormLabel,
} from '@/components/common';
import { ProductFormValues } from '../../schemas/product.schema';
import { VariantAttributes } from './VariantAttributes';
import { MarginIndicator } from './MarginIndicator';
import { convertToSlug } from '@/lib/utils';

interface ProductVariantsTabProps {
  form: UseFormReturn<ProductFormValues>;
  onUploadingChange?: (isUploading: boolean) => void;
}

export const ProductVariantsTab = ({ form, onUploadingChange }: ProductVariantsTabProps) => {
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

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

  return (
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
                    <div className="flex items-center mr-4">
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
                            onUploadingChange={onUploadingChange}
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
                  <MarginIndicator control={form.control} variantIndex={index} />
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
  );
};
