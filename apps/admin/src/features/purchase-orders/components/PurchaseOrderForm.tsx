'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Info,
  Truck,
  Building2,
  Calendar,
  Calculator,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Form,
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
  FormSection, 
  FormGrid, 
  AdminFormLabel, 
  FormActionsBar,
  FormattedNumberInput,
  DateInput
} from '@/components/common';
import { purchaseOrderSchema, PurchaseOrderFormValues } from '../schemas/purchase-order.schema';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useSuppliers } from '@/features/suppliers/hooks/use-suppliers';
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses';
import { useSkus } from '@/features/skus/hooks/use-skus';
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from '../hooks/use-purchase-order-mutation';

// Fallback Mock Suppliers
const mockSuppliers = [
  { id: 'sup-1', name: 'Công ty TNHH Apple Việt Nam', code: 'SUP-APPLE' },
  { id: 'sup-2', name: 'Samsung Electronics Việt Nam', code: 'SUP-SAMSUNG' },
  { id: 'sup-3', name: 'Công ty CP Thế Giới Di Động', code: 'SUP-MWG' },
];

// Fallback Mock Warehouses
const mockWarehouses = [
  { id: 'wh-1', name: 'Kho Chính Quận 1 (TP.HCM)' },
  { id: 'wh-2', name: 'Kho Phụ Quận 7 (TP.HCM)' },
  { id: 'wh-3', name: 'Kho Cầu Giấy (Hà Nội)' },
];

// Fallback Mock SKUs
const mockSkus = [
  { id: 'sku-1', barcode: '893123456781', name: 'iPhone 15 Pro Max - Titan - 256GB', costPrice: 26500000 },
  { id: 'sku-2', barcode: '893123456782', name: 'Samsung Galaxy S24 Ultra - Black - 512GB', costPrice: 24500000 },
  { id: 'sku-3', barcode: '893123456783', name: 'MacBook Pro M3 Max - 36GB - 1TB', costPrice: 56000000 },
  { id: 'sku-4', barcode: '893123456784', name: 'iPad Pro M2 11 inch - WiFi - 128GB', costPrice: 18500000 },
];

interface PurchaseOrderFormProps {
  onSuccess?: () => void;
  initialData?: PurchaseOrderFormValues & { id?: string };
  isDialog?: boolean;
}

export default function PurchaseOrderForm({ 
  onSuccess, 
  initialData, 
  isDialog = false 
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'items'>('general');
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const isEditing = !!initialData?.id;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { data: suppliersRes } = useSuppliers();
  const { data: warehousesRes } = useWarehouses();
  const { data: skusRes } = useSkus({ page: 1, size: 100, isActive: true });

  const fetchedSuppliers = (suppliersRes as any)?.data || (Array.isArray(suppliersRes) ? suppliersRes : []);
  const fetchedWarehouses = (warehousesRes as any)?.data || (Array.isArray(warehousesRes) ? warehousesRes : []);
  const fetchedSkus = (skusRes as any)?.data || (Array.isArray(skusRes) ? skusRes : []);

  const suppliers = fetchedSuppliers.length > 0 ? fetchedSuppliers : mockSuppliers;
  const warehouses = fetchedWarehouses.length > 0 ? fetchedWarehouses : mockWarehouses;
  const skus = fetchedSkus.length > 0 
    ? fetchedSkus.map((item: any) => {
        const costPrice = item.costPrice ?? item.cost_price ?? item.compareAtPrice ?? item.compare_at_price ?? item.price ?? 0;
        return {
          id: item.id,
          barcode: item.barcode || item.skuCode,
          name: `${item.productName || 'Sản phẩm'} - ${item.variantName || item.skuCode}`,
          costPrice,
        };
      })
    : mockSkus;

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: initialData || {
      code: '',
      supplierId: '',
      warehouseId: '',
      expectedDeliveryDate: '',
      note: '',
      items: [
        { skuId: '', orderedQuantity: 1, unitPrice: 0, note: '' }
      ],
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSkuSelect = (index: number, skuId: string) => {
    form.setValue(`items.${index}.skuId`, skuId);
    const selectedSku = (skus as any[]).find((s: any) => s.id === skuId);
    if (selectedSku) {
      const suggestedPrice = selectedSku.costPrice ?? selectedSku.cost_price ?? selectedSku.compareAtPrice ?? selectedSku.compare_at_price ?? selectedSku.price ?? 0;
      form.setValue(`items.${index}.unitPrice`, suggestedPrice);
    }
  };

  async function onSubmit(values: PurchaseOrderFormValues) {
    try {
      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/purchase-orders');
      }
    } catch (error) {
      // Error handling managed in hook onError
    }
  }

  const onErrors = (errors: any) => {
    toast.error('Vui lòng kiểm tra lại các thông tin bắt buộc');
    if (errors.code || errors.supplierId || errors.warehouseId || errors.expectedDeliveryDate || errors.note) {
      setActiveTab('general');
    } else if (errors.items) {
      setActiveTab('items');
    }
  };

  const items = useWatch({
    control: form.control,
    name: 'items'
  });

  const calculateTotalCost = () => {
    return (items || []).reduce((acc, item) => acc + ((item?.orderedQuantity || 0) * (item?.unitPrice || 0)), 0);
  };

  const calculateTotalUnits = () => {
    return (items || []).reduce((acc, item) => acc + (item?.orderedQuantity || 0), 0);
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    { id: 'items', label: 'Danh sách sản phẩm', icon: ShoppingCart },
  ];

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/purchase-orders');
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, onErrors)} 
        className={cn(isDialog ? 'flex flex-col flex-1 overflow-hidden' : 'space-y-6 pb-24')}
      >
        <div className={cn('space-y-6', isDialog ? 'flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2' : '')}>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px scrollbar-none bg-slate-50/50 p-1.5 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'general' | 'items')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  )}
                >
                  <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: General Info */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in-30">
              {/* Left Column: PO Info (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                <FormSection
                  title="Thông tin cơ bản"
                  description="Nhập thông tin đối tác, thời gian và địa điểm nhận hàng."
                >
                  <FormGrid cols={2}>
                    {/* PO Code */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <AdminFormLabel>Mã đơn mua hàng</AdminFormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input 
                                placeholder="Tự động tạo (Ví dụ: PO-202607-001)" 
                                className="h-11 bg-slate-50/50 font-mono text-xs pr-16 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                {...field} 
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded tracking-wider">
                                {field.value ? 'CUSTOM' : 'AUTO'}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Supplier */}
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <AdminFormLabel required>Nhà cung cấp</AdminFormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <SelectValue placeholder="-- Chọn Nhà cung cấp --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((sup: any) => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  <span className="font-medium">{sup.name}</span>
                                  {sup.code && (
                                    <span className="text-[10px] text-slate-400 font-mono ml-2">({sup.code})</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Warehouse */}
                    <FormField
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <AdminFormLabel required>Kho dự kiến nhận</AdminFormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <SelectValue placeholder="-- Chọn kho nhận hàng --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((wh: any) => (
                                <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Expected Delivery Date */}
                    <FormField
                      control={form.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <AdminFormLabel>Ngày giao dự kiến</AdminFormLabel>
                          <FormControl>
                            <DateInput 
                              type="datetime-local" 
                              className="h-11" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Note */}
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <AdminFormLabel>Ghi chú đơn mua hàng</AdminFormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Nhập ghi chú hoặc điều khoản thỏa toán với nhà cung cấp..."
                              className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all focus-visible:border-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormGrid>
                </FormSection>
              </div>

              {/* Right Column: PO Cost Summary (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                <FormSection
                  title="Tổng quan chi phí"
                  description="Tóm tắt tổng số lượng và thành tiền đơn mua."
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-blue-500" /> Số mặt hàng (SKU):
                      </span>
                      <strong className="text-slate-800 font-semibold">{items?.length || 0}</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <ShoppingCart size={14} className="text-blue-500" /> Tổng số lượng đặt:
                      </span>
                      <strong className="text-slate-800 font-semibold">{calculateTotalUnits()} sản phẩm</strong>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Tổng thành tiền (chưa VAT):
                      </span>
                      <div className="text-2xl font-bold text-blue-600 mt-1">
                        {formatCurrency(calculateTotalCost())}
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>
            </div>
          )}

          {/* Tab 2: Items List */}
          {activeTab === 'items' && (
            <div className="animate-in fade-in-30 space-y-6">
              <FormSection
                title="Danh sách sản phẩm đặt mua"
                description="Chọn mặt hàng, số lượng và giá thỏa thuận với Nhà cung cấp."
              >
                <div className="flex justify-end mb-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ skuId: '', orderedQuantity: 1, unitPrice: 0, note: '' })}
                    className="gap-1.5 border-blue-600 text-blue-600 hover:bg-blue-50 bg-white font-bold text-xs"
                  >
                    <Plus size={16} /> Thêm sản phẩm
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((fieldItem, index) => {
                    const itemQuantity = form.watch(`items.${index}.orderedQuantity`) || 0;
                    const itemUnitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                    const itemSubtotal = itemQuantity * itemUnitPrice;

                    return (
                      <div 
                        key={fieldItem.id} 
                        className="relative p-5 rounded-2xl border border-slate-300 bg-slate-50/80 space-y-4 transition-all hover:border-slate-400 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Sản phẩm #{index + 1}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500">
                              Thành tiền: <strong className="text-blue-700 font-semibold text-sm">{formatCurrency(itemSubtotal)}</strong>
                            </span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => remove(index)}
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              disabled={fields.length === 1}
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* SKU Selection */}
                          <div className="md:col-span-6">
                            <FormField
                              control={form.control}
                              name={`items.${index}.skuId`}
                              render={({ field }) => (
                                <FormItem>
                                  <AdminFormLabel required className="text-center block w-full">Sản phẩm (SKU)</AdminFormLabel>
                                  <Select 
                                    onValueChange={(val) => handleSkuSelect(index, val)} 
                                    value={field.value || undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 justify-center text-center [&>span]:w-full [&>span]:text-center">
                                        <SelectValue placeholder="-- Chọn SKU sản phẩm --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {skus.map((sku: any) => (
                                        <SelectItem 
                                          key={sku.id} 
                                          value={sku.id}
                                          className="justify-center text-center [&>span]:w-full [&>span]:flex [&>span]:flex-col [&>span]:items-center"
                                        >
                                          <span className="font-medium text-slate-800">{sku.name}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">Giá mua gợi ý: {formatCurrency(sku.costPrice)}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.orderedQuantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <AdminFormLabel required className="text-center block w-full">Số lượng đặt</AdminFormLabel>
                                  <FormControl>
                                    <FormattedNumberInput 
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="1"
                                      min={1}
                                      className="h-11 font-semibold text-center"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="md:col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <AdminFormLabel required className="text-center block w-full">Giá mua đơn vị (VND)</AdminFormLabel>
                                  <FormControl>
                                    <FormattedNumberInput 
                                      value={field.value}
                                      onChange={field.onChange}
                                      placeholder="0"
                                      suffix="₫"
                                      min={0}
                                      className="h-11 text-center font-mono"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </FormSection>
            </div>
          )}
        </div>

        {/* Sticky Actions Bar */}
        <FormActionsBar
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          submitText={initialData?.id ? 'Cập nhật đơn mua hàng' : 'Lưu đơn mua hàng'}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}

