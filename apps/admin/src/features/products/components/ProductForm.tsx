'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Info,
  Loader2,
  Save,
  Settings2,
} from 'lucide-react';

import {
  Form,
} from '@/components/ui/form';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import {
  productSchema,
  ProductFormValues,
} from '../schemas/product.schema';
import { cn, convertToSlug, convertToSku } from '@/lib/utils';
import { toast } from 'sonner';

import { ProductGeneralTab } from './product-form/ProductGeneralTab';
import { ProductVariantsTab } from './product-form/ProductVariantsTab';

import { Product, ProductDetail } from '../types/product.interface';
import { getProductFormValues } from '../lib/product-form-values';
import { ProductInventoryTable } from './ProductInventoryTable';

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Product;
  inventory?: ProductDetail['skus'];
}

export default function ProductForm({ onSuccess, onCancel, initialData, inventory }: ProductFormProps): React.JSX.Element {
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
  const hasGeneralErrors = Object.keys(formErrors).some((field) => field !== 'variants');
  const hasVariantErrors = Boolean(formErrors.variants);

  // Auto-slug generator
  useEffect(() => {
    if (nameValue && !isSlugEditedRef.current && !initialData?.id) {
      form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, initialData]);

  const onSubmit = async (values: ProductFormValues): Promise<void> => {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }
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
        const savedProduct = await updateMutation.mutateAsync({ id: initialData.id, values: payload });
        form.reset(getProductFormValues(savedProduct));
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Product save failed:', error);
    }
  };

  const onErrors = (errors: FieldErrors<ProductFormValues>): void => {
    const errorKeys = Object.keys(errors);
    const generalErr = errorKeys.some((field) => field !== 'variants');
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
        className='space-y-6'
      >
        <PageHeader
          title={initialData ? `Cập nhật: ${initialData.name}` : 'Thêm sản phẩm mới'}
          description='Quản lý thông tin, hình ảnh, phân loại và giá bán theo từng biến thể.'
          actions={
            <>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading || isImageUploading}>
                Danh sách sản phẩm
              </Button>
              <Button type='submit' disabled={isLoading || isImageUploading} className='gap-2'>
                {isLoading || isImageUploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
                {isImageUploading ? 'Đang tải ảnh...' : initialData ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
              </Button>
            </>
          }
        />
        <div className='space-y-6'>
          {/* Custom Stepper Tabs Bar */}
          <div role="tablist" aria-label="Thông tin sản phẩm" className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`product-tab-${tab.id}`}
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
            <div role="tabpanel" id="tab-panel-general" aria-labelledby='product-tab-general'>
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
            <div role="tabpanel" id="tab-panel-variants" aria-labelledby='product-tab-variants' className='space-y-6'>
              <ProductVariantsTab
                form={form}
                onUploadingChange={setIsImageUploading}
              />
              {inventory && <ProductInventoryTable inventory={inventory} />}
            </div>
          )}
        </div>

      </form>
    </Form>
  );
}
