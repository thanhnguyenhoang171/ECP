'use client';

import React, { useState } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Sparkles, PackageCheck, Copy, SlidersHorizontal, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { convertToSlug, generateRandomSku } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductVariantsTabProps {
  form: UseFormReturn<ProductFormValues>;
  onUploadingChange?: (isUploading: boolean) => void;
}

export const ProductVariantsTab = ({ form, onUploadingChange }: ProductVariantsTabProps) => {
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkCompareAtPrice, setBulkCompareAtPrice] = useState<string>('');
  const [bulkCostPrice, setBulkCostPrice] = useState<string>('');

  const handleAutoGenerateAllSkus = (): void => {
    let mainSku = form.getValues('sku');
    if (!mainSku) {
      mainSku = generateRandomSku('SKU', 8);
      form.setValue('sku', mainSku, { shouldValidate: true, shouldDirty: true });
    }
    variantFields.forEach((_, index) => {
      const randomPart = generateRandomSku('', 4);
      form.setValue(`variants.${index}.sku`, `${mainSku}-${randomPart}`, { shouldValidate: true, shouldDirty: true });
    });
    toast.success('Đã tự động sinh mã SKU ngẫu nhiên cho tất cả biến thể');
  };

  const handleApplyBulkPrices = (): void => {
    if (!bulkPrice && !bulkCompareAtPrice && !bulkCostPrice) {
      toast.warning('Vui lòng nhập ít nhất một mức giá để áp dụng');
      return;
    }

    variantFields.forEach((_, index) => {
      if (bulkPrice !== '') {
        form.setValue(`variants.${index}.price`, Number(bulkPrice), { shouldValidate: true, shouldDirty: true });
      }
      if (bulkCompareAtPrice !== '') {
        form.setValue(`variants.${index}.compareAtPrice`, Number(bulkCompareAtPrice), { shouldValidate: true, shouldDirty: true });
      }
      if (bulkCostPrice !== '') {
        form.setValue(`variants.${index}.costPrice`, Number(bulkCostPrice), { shouldValidate: true, shouldDirty: true });
      }
    });

    toast.success(`Đã áp dụng giá đồng loạt cho ${variantFields.length} biến thể`);
    setIsBulkOpen(false);
    setBulkPrice('');
    setBulkCompareAtPrice('');
    setBulkCostPrice('');
  };

  const handleDuplicateVariant = (index: number): void => {
    const current = form.getValues(`variants.${index}`);
    let mainSku = form.getValues('sku');
    if (!mainSku) {
      mainSku = generateRandomSku('SKU', 8);
      form.setValue('sku', mainSku, { shouldValidate: true, shouldDirty: true });
    }
    const randomPart = generateRandomSku('', 4);
    appendVariant({
      ...current,
      skuId: undefined,
      sku: `${mainSku}-${randomPart}`,
      attributes: current.attributes?.map((a) => ({ ...a })) || [],
    });
    toast.success('Đã sao chép cấu hình biến thể mới');
  };

  return (
    <section className="space-y-5 animate-in fade-in-30">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Danh sách biến thể & giá bán
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {variantFields.length} biến thể
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình giá bán, giá vốn và thuộc tính cho từng phân loại mặt hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variantFields.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                onClick={() => setIsBulkOpen((prev) => !prev)}
              >
                <SlidersHorizontal size={13} className="text-blue-600" />
                Áp dụng giá hàng loạt
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                onClick={handleAutoGenerateAllSkus}
              >
                <Sparkles size={13} className="text-amber-500" />
                Sinh SKU tự động
              </Button>
            </>
          )}

          <Button
            type="button"
            size="sm"
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() =>
              appendVariant({
                sku: '',
                price: 0,
                compareAtPrice: 0,
                costPrice: 0,
                barcode: '',
                barcodeType: 'EAN-13',
                isActive: true,
                image: '',
                attributes: [],
              })
            }
          >
            <Plus size={14} /> Thêm biến thể
          </Button>
        </div>
      </div>

      {/* Bulk Price Applicator Panel */}
      {isBulkOpen && variantFields.length > 0 && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <SlidersHorizontal size={14} className="text-blue-600" />
              <span>Thiết lập giá nhanh cho toàn bộ {variantFields.length} biến thể</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700"
              onClick={() => setIsBulkOpen(false)}
            >
              <X size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <AdminFormLabel className="text-[11px] text-slate-700">Giá bán (VNĐ)</AdminFormLabel>
              <Input
                type="number"
                placeholder="Nhập giá bán chung..."
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="h-9 text-xs bg-white border-blue-200 text-blue-700 font-bold focus:border-blue-500"
              />
            </div>
            <div>
              <AdminFormLabel className="text-[11px] text-slate-700">Giá so sánh / Giá gốc (VNĐ)</AdminFormLabel>
              <Input
                type="number"
                placeholder="Nhập giá niêm yết cũ..."
                value={bulkCompareAtPrice}
                onChange={(e) => setBulkCompareAtPrice(e.target.value)}
                className="h-9 text-xs bg-white border-blue-200 text-slate-700 focus:border-blue-500"
              />
            </div>
            <div>
              <AdminFormLabel className="text-[11px] text-slate-700">Giá vốn nhập (VNĐ)</AdminFormLabel>
              <Input
                type="number"
                placeholder="Nhập giá vốn chung..."
                value={bulkCostPrice}
                onChange={(e) => setBulkCostPrice(e.target.value)}
                className="h-9 text-xs bg-white border-blue-200 text-slate-700 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-slate-600 hover:bg-slate-200/50"
              onClick={() => setIsBulkOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleApplyBulkPrices}
            >
              <Check size={14} /> Áp dụng ngay
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {variantFields.length === 0 && (
        <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <PackageCheck size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs text-slate-600 font-medium">
            Sản phẩm chưa có biến thể nào. Bấm nút &quot;Thêm biến thể&quot; để thiết lập giá bán và mã SKU.
          </p>
        </div>
      )}

      {/* Variant Cards Streamlined Workstation */}
      <div className="space-y-4">
        {variantFields.map((field, index) => (
          <Card
            key={field.id}
            className="border-slate-200 shadow-xs transition-all hover:border-slate-300 rounded-xl overflow-hidden"
          >
            {/* Header: SỐ THỨ TỰ, SKU, ACTIVE SWITCH, DUPLICATE, TRASH */}
            <CardHeader className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/80 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[11px] shadow-xs">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-slate-800 font-mono tracking-wide">
                  {form.watch(`variants.${index}.sku`) || 'BIẾN THỂ CHƯA CÓ SKU'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`variants.${index}.isActive`}
                  render={({ field }) => (
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="text-[11px] text-slate-600 font-medium">Kích hoạt bán:</span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="scale-75 data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 rounded-md"
                  title="Nhân bản biến thể này"
                  onClick={() => handleDuplicateVariant(index)}
                >
                  <Copy size={13} />
                </Button>

                {variantFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-md"
                    title="Xóa biến thể"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Ảnh biến thể */}
                <div className="lg:col-span-2 flex flex-col items-center">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.image`}
                    render={({ field }) => (
                      <FormItem className="space-y-1 w-full text-center">
                        <AdminFormLabel className="text-[10px] text-slate-500">Ảnh riêng (tùy chọn)</AdminFormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onUploadingChange={onUploadingChange}
                            folder="products"
                            className="w-full aspect-square max-w-[100px] mx-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Các trường giá và SKU */}
                <div className="lg:col-span-10 space-y-3">
                  <FormGrid cols={4} className="gap-3">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <AdminFormLabel className="text-xs">Mã SKU</AdminFormLabel>
                            <button
                              type="button"
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                              onClick={() => {
                                let main = form.getValues('sku');
                                if (!main) {
                                  main = generateRandomSku('SKU', 8);
                                  form.setValue('sku', main, { shouldValidate: true, shouldDirty: true });
                                }
                                const randomPart = generateRandomSku('', 4);
                                form.setValue(`variants.${index}.sku`, `${main}-${randomPart}`, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                            >
                              Tự sinh
                            </button>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Vd: SKU-A8F2K9M1-X7P2"
                              {...field}
                              className="h-9 font-mono text-xs uppercase border-slate-200"
                            />
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
                          <AdminFormLabel required className="text-xs">Giá bán (đ)</AdminFormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-9 text-xs font-bold text-blue-700 border-slate-200 focus:border-blue-500"
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
                          <AdminFormLabel className="text-xs">Giá gốc/So sánh (đ)</AdminFormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-9 text-xs text-slate-500 line-through border-slate-200"
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
                          <AdminFormLabel className="text-xs">Giá vốn nhập (đ)</AdminFormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-9 text-xs text-slate-800 border-slate-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormGrid>

                  {/* Chỉ báo lợi nhuận */}
                  <MarginIndicator control={form.control} variantIndex={index} />

                  {/* Mã vạch & Thuộc tính */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.barcode`}
                      render={({ field }) => (
                        <FormItem>
                          <AdminFormLabel className="text-[11px]">Mã vạch (Barcode)</AdminFormLabel>
                          <FormControl>
                            <Input placeholder="Vd: 8931234567890" {...field} className="h-8 text-xs font-mono border-slate-200" />
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
                          <AdminFormLabel className="text-[11px]">Loại Barcode</AdminFormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
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
                  </div>
                </div>
              </div>

              {/* Thuộc tính phân loại của biến thể */}
              <div className="border-t border-slate-100 pt-3">
                <VariantAttributes control={form.control} variantIndex={index} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
