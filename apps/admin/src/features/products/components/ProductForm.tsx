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
import { useActiveBrands } from '@/features/brands/hooks/use-brands';
import { Brand } from '@/features/brands/types/brand.interface';
import { useCreateProduct, useUpdateProduct } from '../hooks/use-product-mutation';
import { 
  productSchema, 
  ProductFormValues, 
} from '../schemas/product.schema';
import { cn, convertToSlug, convertToSku, getCloudinaryPublicId } from '@/lib/utils';
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

  const { data: activeBrands } = useActiveBrands();
  const brands = activeBrands || [];

  // Sử dụng mock data nếu API không trả về danh mục nào để test UI
  const categories = fetchedCategories.length > 0 ? fetchedCategories : [
    { id: 'c1', name: 'Snack & Bánh kẹo Thái', slug: 'snack-banh-keo', level: 1 },
    { id: 'c2', name: 'Nước giải khát & Trà sữa', slug: 'nuoc-giai-khat', level: 1 },
    { id: 'c3', name: 'Gia vị & Đồ đóng hộp Thái', slug: 'gia-vi-do-dong-hop', level: 1 },
  ] as Category[];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [activeTab, setActiveTab] = useState<'general' | 'logistics' | 'variants' | 'seo'>('general');
  const isSlugEditedRef = useRef(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

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
      brandId: (initialData as any)?.brandId || '',
      categoryId: initialData?.categoryId || '',
      description: initialData?.description || '',
      thumbnail: initialData?.thumbnail || '',
      images: initialData?.images || [],
      specifications: initialData?.specifications 
        ? transformSpecificationsToArray(initialData.specifications) 
        : [],
      isPublished: initialData?.isPublished ?? (initialData as any)?.published ?? true,
      isFeatured: initialData?.isFeatured ?? (initialData as any)?.featured ?? false,
      isNew: initialData?.isNew ?? (initialData as any)?.new ?? false,
      isBestSeller: initialData?.isBestSeller ?? (initialData as any)?.bestSeller ?? false,
      viewCount: initialData?.viewCount ?? 0,
      soldCount: initialData?.soldCount ?? 0,
      ratingAvg: initialData?.ratingAvg ?? 0,
      ratingCount: initialData?.ratingCount ?? 0,
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
    if (isImageUploading) {
      toast.warning('Ảnh đang được tải lên cloud, vui lòng chờ trong giây lát!');
      return;
    }

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

    const finalParentSku = values.sku?.trim() || convertToSku(values.name);

    const payload = {
      ...values,
      sku: finalParentSku,
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
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    { id: 'variants', label: 'Biến thể & Giá', icon: Settings2 },
  ];

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, onErrors)} 
        className={cn(isDialog ? "flex flex-col flex-1 overflow-hidden" : "space-y-6 pb-24")}
      >
        <div className={cn("space-y-6", isDialog && "flex-1 overflow-y-auto p-6")}>
          {/* Custom Tabs Bar */}
          <div className="flex border-b border-slate-200 gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 -mb-px",
                    isActive 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className="h-4 w-4" />
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
              brands={brands}
              isSlugEditedRef={isSlugEditedRef} 
              nameValue={nameValue} 
              onUploadingChange={setIsImageUploading}
            />
          )}

          {/* Tab 3: Variants */}
          {activeTab === 'variants' && (
            <ProductVariantsTab 
              form={form} 
              onUploadingChange={setIsImageUploading}
            />
          )}
        </div>

        {/* Sticky Actions Bar */}
        <FormActionsBar
          onCancel={onSuccess}
          isSubmitting={isLoading || isImageUploading}
          submitText={isImageUploading ? 'Đang tải ảnh lên...' : (initialData?.id ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
