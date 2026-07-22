'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { useCategories } from '@/features/categories/hooks/use-categories';
import { Category } from '@/features/categories/types/category.interface';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import { 
  productSchema, 
  ProductFormValues, 
} from '../schemas/product.schema';
import { cn, convertToSlug, getCloudinaryPublicId } from '@/lib/utils';
import { toast } from 'sonner';

import { ProductGeneralTab } from './product-form/ProductGeneralTab';
import { ProductVariantsTab } from './product-form/ProductVariantsTab';

interface ProductFormProps {
  onSuccess: () => void;
  initialData?: ProductFormValues & { id?: string };
  isDialog?: boolean;
}

export default function ProductForm({ onSuccess, initialData, isDialog = false }: ProductFormProps) {
  const { data: categoriesData } = useCategories({ page: 0, size: 100 });
  const fetchedCategories = categoriesData?.data || [];
  
  // Sử dụng mock data nếu API không trả về danh mục nào để test UI
  const categories = fetchedCategories.length > 0 ? fetchedCategories : [
    { id: 'c1', name: 'Điện thoại di động', slug: 'dien-thoai', level: 1 },
    { id: 'c2', name: 'Laptop & Máy tính', slug: 'laptop', level: 1 },
    { id: 'c3', name: 'Phụ kiện công nghệ', slug: 'phu-kien', level: 1 },
  ] as Category[];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [activeTab, setActiveTab] = useState<'general' | 'logistics' | 'variants' | 'seo'>('general');
  const isSlugEditedRef = useRef(false);

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
      isPublished: initialData?.isPublished ?? (initialData as any)?.published ?? true,
      metaTitle: (initialData as any)?.metaTitle || '',
      metaDescription: (initialData as any)?.metaDescription || '',
      metaKeywords: (initialData as any)?.metaKeywords || '',
      variants: initialData?.variants?.map(v => ({
        sku: v.sku || '',
        price: v.price || 0,
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

  const nameValue = useWatch({
    control: form.control,
    name: 'name',
  });

  // Auto-slug generator
  useEffect(() => {
    if (nameValue && !isSlugEditedRef.current && !initialData?.id) {
      form.setValue('slug', convertToSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, initialData]);

  async function onSubmit(values: ProductFormValues) {
    const transformToMap = (arr: {key: string, value: any}[]) => {
      return arr.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);
    };

    const mapImage = (url?: string) => {
      if (!url) return null;
      return { url, publicId: getCloudinaryPublicId(url) || '' };
    };

    const payload = {
      ...values,
      thumbnail: values.thumbnail ? mapImage(values.thumbnail) : null,
      images: values.images?.map(mapImage).filter(Boolean) || [],
      specifications: transformToMap(values.specifications as any),
      variants: values.variants.map(v => ({
        ...v,
        image: v.image ? mapImage(v.image) : null,
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

  const onErrors = (errors: any) => {
    toast.error('Vui lòng kiểm tra lại các thông tin bắt buộc');
    // Auto-switch to the tab with errors
    if (errors.name || errors.brand || errors.categoryId || errors.description || errors.sku || errors.isPublished) {
      setActiveTab('general');
    } else if (errors.variants) {
      setActiveTab('variants');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    { id: 'variants', label: 'Biến thể sản phẩm', icon: Settings2 },
    // { id: 'seo', label: '', icon: Globe },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onErrors)} className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}>
        <div className={cn("space-y-6", isDialog ? "flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2" : "")}>
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
            <ProductGeneralTab 
              form={form} 
              categories={categories} 
              isSlugEditedRef={isSlugEditedRef} 
              nameValue={nameValue} 
            />
          )}

          {/* Tab 3: Variants */}
          {activeTab === 'variants' && (
            <ProductVariantsTab 
              form={form} 
            />
          )}
        </div>

        {/* Sticky Actions Bar */}
        <FormActionsBar
          onCancel={onSuccess}
          isSubmitting={isLoading}
          submitText={initialData?.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
