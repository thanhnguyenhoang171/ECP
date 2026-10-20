'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Info,
  Settings2,
  // Globe,
} from 'lucide-react';

import {
  Form,
} from '@/components/ui/form';
import {
  FormActionsBar,
} from '@/components/common';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import {
  productSchema,
  ProductFormValues,
} from '../schemas/product.schema';
import { cn, convertToSlug, convertToSku } from '@/lib/utils';
import { toast } from 'sonner';

import { ProductGeneralTab } from './product-form/ProductGeneralTab';
import { ProductVariantsTab } from './product-form/ProductVariantsTab';

import { Product } from '../types/product.interface';
import { getProductFormValues } from '../lib/product-form-values';

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Product;
  isDialog?: boolean;
}

export default function ProductForm({ onSuccess, onCancel, initialData, isDialog = false }: ProductFormProps): React.JSX.Element {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [activeTab, setActiveTab] = useState<'general' | 'variants'>('general');
  const isSlugEditedRef = useRef(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: getProductFormValues(initialData),
  });

  const nameValue = useWatch({
    control: form.control,
    name: 'name',
  });

  const variantsValue = useWatch({
    control: form.control,
    name: 'variants',
  });
  const variantCount = variantsValue?.length || 0;

  const formErrors = form.formState.errors;
  const hasGeneralErrors = Boolean(
    formErrors.name || formErrors.slug || formErrors.categoryId || formErrors.brandId || formErrors.description || formErrors.thumbnail
  );
  const hasVariantErrors = Boolean(formErrors.variants);

  // Auto-slug generator
  useEffect(() => {
    if (nameValue && !isSlugEditedRef.current && !initialData?.id) {
      form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, initialData]);

  async function onSubmit(values: ProductFormValues) {
    if (isImageUploading) {
      toast.warning('Ảnh đang được tải lên cloud, vui lòng chờ trong giây lát!');
      return;
    }

    const finalParentSku = values.sku?.trim() || convertToSku(values.name);

    const payload = {
      ...values,
      sku: finalParentSku,
    };

    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Product save failed:', error);
    }
  }

  const onErrors = (errors: FieldErrors<ProductFormValues>) => {
    const errorKeys = Object.keys(errors);
    const generalFields = ['name', 'slug', 'categoryId', 'brandId', 'description', 'thumbnail'];
    const generalErr = errorKeys.some(key => generalFields.includes(key));
    const variantErr = errorKeys.includes('variants');

    if (generalErr && activeTab !== 'general') {
      setActiveTab('general');
      toast.error('Có thông tin chưa hợp lệ ở tab Thông tin chung');
    } else if (variantErr && activeTab !== 'variants') {
      setActiveTab('variants');
      toast.error('Vui lòng kiểm tra lại thông tin các biến thể & giá');
    } else {
      toast.error('Vui lòng kiểm tra lại các thông tin bắt buộc');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const tabs = [
    {
      id: 'general',
      step: '01',
      label: 'Thông tin chung',
      icon: Info,
      hasError: hasGeneralErrors
    },
    {
      id: 'variants',
      step: '02',
      label: 'Biến thể & Giá',
      icon: Settings2,
      badge: variantCount > 0 ? `${variantCount}` : undefined,
      hasError: hasVariantErrors
    },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onErrors)}
        className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}
      >
        <div className={cn("space-y-6", isDialog && "flex-1 overflow-y-auto p-6")}>
          {/* Custom Stepper Tabs Bar */}
          <div role="tablist" aria-label="Các bước tạo sản phẩm" className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tab-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id === 'variants' ? 'variants' : 'general')}
                  className={cn(
                    "relative flex items-center gap-2 pb-3.5 pt-1 px-1 text-xs font-bold transition-all border-b-2 -mb-px shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive
                      ? "border-blue-600 text-blue-700 font-extrabold"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  )}
                >
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  )}>
                    {tab.step}
                  </span>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {tab.badge}
                    </span>
                  )}

                  {tab.hasError && (
                    <span className="relative flex h-2 w-2 ml-1" title="Có lỗi nhập liệu">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: General Info */}
          {activeTab === 'general' && (
            <div role="tabpanel" id="tab-panel-general">
              <ProductGeneralTab
                form={form}
                isSlugEditedRef={isSlugEditedRef}
                nameValue={nameValue}
                onUploadingChange={setIsImageUploading}
              />
            </div>
          )}

          {/* Tab 2: Variants */}
          {activeTab === 'variants' && (
            <div role="tabpanel" id="tab-panel-variants">
              <ProductVariantsTab
                form={form}
                onUploadingChange={setIsImageUploading}
              />
            </div>
          )}
        </div>

        {/* Sticky Actions Bar */}
        <FormActionsBar
          onCancel={onCancel}
          isSubmitting={isLoading || isImageUploading}
          submitText={isImageUploading ? 'Đang tải ảnh lên...' : (initialData?.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
