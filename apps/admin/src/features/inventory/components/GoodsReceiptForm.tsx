'use client';

import { WarehouseRequestError } from '@/features/inventory/components/WarehouseRequestError';
import Link from 'next/link';

import React, { useState, useCallback, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Package, FileText, ScanBarcode, CheckCircle2, Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FormSection,
  FormGrid,
  AdminFormLabel,
  FormActionsBar,
  FormattedNumberInput,
  DateInput
} from '@/components/common';
import { goodsReceiptSchema, GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';
import { useInventorySkus } from '@/features/inventory/hooks/use-inventory-skus';
import { useWarehouses } from '@/features/warehouses/hooks/use-warehouses';
import { usePurchaseOrders } from '@/features/purchase-orders/hooks/use-purchase-order-mutation';
import { useCreateGoodsReceipt, useUpdateGoodsReceipt } from '../hooks/use-goods-receipt-mutation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { BarcodeScannerDialog } from './BarcodeScannerDialog';
import { barcodeApi } from '../api/barcode.api';
import { addScannedReceiptItem } from '../lib/scanned-receipt';
import type { BarcodeLookup } from '../types/barcode';
import type { Sku } from '@/features/skus/types/sku.interface';
import { getApiErrorMessage } from '@/constants/errorMessages';

interface GoodsReceiptFormProps {
  onSuccess?: () => void;
  initialData?: GoodsReceiptFormValues & { id?: string };
  isDialog?: boolean;
}

export default function GoodsReceiptForm({
  onSuccess,
  initialData,
  isDialog = false,
}: GoodsReceiptFormProps) : React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poIdParam = searchParams.get('poId');

  const [activeTab, setActiveTab] = useState<'general' | 'items'>('general');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedSkus, setScannedSkus] = useState<Array<Sku & { costPrice: number; price: number }>>([]);
  const prefillApplied = useRef(false);

  const createMutation = useCreateGoodsReceipt();
  const updateMutation = useUpdateGoodsReceipt();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { data: warehousesRes, error: sourceError0, isPending: sourceLoading0, refetch: refetchSource0 } = useWarehouses();
  const { data: posRes, error: sourceError1, isPending: sourceLoading1, refetch: refetchSource1 } = usePurchaseOrders();
  const { data: skuResponse, error: sourceError2, isPending: sourceLoading2, refetch: refetchSource2 } = useInventorySkus();
  const isLoadingSkus = sourceLoading2;

  const warehouses = (warehousesRes ?? []).filter((item) => item.isActive || item.id === initialData?.warehouseId);
  const purchaseOrders = React.useMemo(() => (posRes ?? []).filter((order) => order.status === 'ORDERED' || order.status === 'PARTIALLY_RECEIVED'), [posRes]);
  const activeSkus = React.useMemo(() => [...(skuResponse ?? []).filter(item => !scannedSkus.some(scanned => scanned.id === item.id)), ...scannedSkus].map(item => ({ ...item,
    name: `${item.productName} · ${item.variantName || item.skuCode}`, price: 'price' in item ? Number(item.price) : 0, costPrice: 'costPrice' in item ? Number(item.costPrice) : 0,
  })), [skuResponse, scannedSkus]);

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: initialData || {
      receiptCode: '',
      purchaseOrderId: '',
      warehouseId: '',
      note: '',
      items: [
        { skuId: '', quantity: 1, unitCost: 0, batchCode: '', manufactureDate: '', expiryDate: '' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedPOId = useWatch({
    control: form.control,
    name: 'purchaseOrderId'
  });

  const selectedPO = purchaseOrders.find((po) => po.id === selectedPOId);

  // Handle PO selection and auto-filling
  const handlePOSelect = (poId: string) => {
    form.setValue('purchaseOrderId', poId);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      if (po.warehouseId) {
        form.setValue('warehouseId', po.warehouseId);
      }
      if (po.items && po.items.length > 0) {
        const mappedItems = po.items.filter((it) => it.orderedQuantity > it.receivedQuantity).map((it) => ({
          skuId: it.skuId,
          quantity: it.orderedQuantity - it.receivedQuantity,
          unitCost: it.unitPrice,
          batchCode: '',
          manufactureDate: '',
          expiryDate: '',
        }));
        form.setValue('items', mappedItems);
      }
      toast.success(`Đã tự động nạp ${po.items?.length || 0} sản phẩm từ đơn mua hàng ${po.code}`);
    }
  };

  React.useEffect(() => {
    if (!poIdParam || form.getValues('purchaseOrderId') === poIdParam) { return; }
    const order = purchaseOrders.find((item) => item.id === poIdParam);
    if (order) {
      form.setValue('purchaseOrderId', order.id);
      form.setValue('warehouseId', order.warehouseId);
      form.setValue('items', order.items.filter((item) => item.orderedQuantity > item.receivedQuantity).map((item) => ({
        skuId: item.skuId, quantity: item.orderedQuantity - item.receivedQuantity, unitCost: item.unitPrice,
        batchCode: '', manufactureDate: '', expiryDate: '',
      })));
    }
  }, [poIdParam, purchaseOrders, form]);

  const handleClearPO = () => {
    form.setValue('purchaseOrderId', '');
    toast.info('Đã hủy liên kết với Đơn mua hàng');
  };

  const handleSkuSelect = (index: number, skuId: string) => {
    form.setValue(`items.${index}.skuId`, skuId);
    const selectedSku = activeSkus.find((s) => s.id === skuId);
    if (selectedSku) {
      const suggestedPrice = selectedSku.costPrice;
      form.setValue(`items.${index}.unitCost`, suggestedPrice);
    }
  };

  const handleScannedItem = useCallback((found: BarcodeLookup): void => {
    if (!form.getValues('warehouseId')) { throw new Error('Chọn kho nhận hàng trước khi quét mã.'); }
    const items = addScannedReceiptItem(form.getValues('items'), found, selectedPO);
    form.setValue('items', items, { shouldDirty: true, shouldValidate: true });
    setScannedSkus(current => [...current.filter(item => item.id !== found.sku.id), { ...found.sku, costPrice: found.costPrice, price: found.price }]);
  }, [form, selectedPO]);

  const prefillCode = searchParams.get('barcode');
  const prefillWarehouse = searchParams.get('warehouseId') || undefined;
  React.useEffect(() => {
    if (!prefillCode || initialData?.id || poIdParam || prefillApplied.current) { return; }
    const controller = new AbortController();
    const prefill = async (): Promise<void> => {
      try {
        const found = await barcodeApi.lookup(prefillCode, prefillWarehouse, controller.signal);
        if (controller.signal.aborted || prefillApplied.current || form.formState.isDirty) { return; }
        if (!found.sku.active) { throw new Error('SKU đã ngừng hoạt động.'); }
        prefillApplied.current = true;
        setScannedSkus([{ ...found.sku, costPrice: found.costPrice, price: found.price }]);
        if (prefillWarehouse) { form.setValue('warehouseId', prefillWarehouse); }
        form.setValue('items', [{ skuId: found.sku.id, quantity: 1, unitCost: found.costPrice, batchCode: '', manufactureDate: '', expiryDate: '' }]);
        setActiveTab('items');
      } catch (cause: unknown) {
        if (!controller.signal.aborted) { toast.error(getApiErrorMessage(cause, 'Không thể nạp mặt hàng đã quét')); }
      }
    };
    void prefill();
    return () => controller.abort();
  }, [prefillCode, prefillWarehouse, initialData?.id, poIdParam, form]);

  async function onSubmit(values: GoodsReceiptFormValues) {
    if (isScannerOpen) { return; }
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/goods-receipt');
      }
    } catch (error) {
      console.error('Goods receipt save failed', error);
    }
  }

  const onErrors = (errors: import('react-hook-form').FieldErrors<GoodsReceiptFormValues>) => {
    toast.error('Vui lòng kiểm tra lại các thông tin bắt buộc');
    if (errors.receiptCode || errors.purchaseOrderId || errors.warehouseId || errors.note) {
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
    return (items || []).reduce((acc, item) => acc + ((item?.quantity || 0) * (item?.unitCost || 0)), 0);
  };

  const calculateTotalUnits = () => {
    return (items || []).reduce((acc, item) => acc + (item?.quantity || 0), 0);
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Info },
    { id: 'items', label: 'Danh sách sản phẩm nhập', icon: Package },
  ];

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/goods-receipt');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onErrors)}
        className={cn(isDialog ? 'flex flex-col flex-1 overflow-hidden' : 'space-y-6 pb-24')}
      >
        <div className={cn('space-y-6', isDialog ? 'flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-2' : '')}>
          <WarehouseRequestError error={sourceError0} retry={() => { void refetchSource0(); }} />
          <WarehouseRequestError error={sourceError1} retry={() => { void refetchSource1(); }} />
          <WarehouseRequestError error={sourceError2} retry={() => { void refetchSource2(); }} />
          <div className='flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600'>
            <span>Cần có kho hàng và SKU đang hoạt động trước khi lập chứng từ.</span>
            <Link href='/warehouses/create' className='font-semibold text-blue-600 hover:underline'>Thêm kho</Link>
            <Link href='/products/create' className='font-semibold text-blue-600 hover:underline'>Thêm sản phẩm</Link>
            <Link href='/suppliers/create' className='font-semibold text-blue-600 hover:underline'>Thêm nhà cung cấp</Link>
          </div>
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
              {/* Left Column: General Info (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                <FormSection
                  title="Thông tin cơ bản"
                  description="Thông tin kho nhận, đơn mua hàng liên quan và ghi chú nhập."
                >
                  <FormGrid cols={2}>
                    {/* Receipt Code */}
                    <FormField
                      control={form.control}
                      name="receiptCode"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <AdminFormLabel>Mã phiếu nhập kho</AdminFormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                placeholder="Tự động tạo (Ví dụ: GR-202607-001)"
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

                    {/* Purchase Order Selection */}
                    <FormField
                      control={form.control}
                      name="purchaseOrderId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <AdminFormLabel>Đơn mua hàng (PO)</AdminFormLabel>
                            {field.value && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearPO}
                                className="h-auto p-0 text-[10px] text-red-600 hover:text-red-700 font-bold"
                              >
                                Hủy chọn PO
                              </Button>
                            )}
                          </div>
                          <Select
                            onValueChange={(val) => handlePOSelect(val)}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <SelectValue placeholder="-- Chọn PO để tự động điền --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purchaseOrders.map((po) => (
                                <SelectItem key={po.id} value={po.id}>
                                  <span className="font-mono font-bold text-blue-600 mr-2">{po.code}</span>
                                  <span className="text-xs text-slate-600">({po.supplierName || 'Nhà cung cấp'})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedPO && (
                            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1 text-xs mt-2">
                              <div className="flex items-center justify-between text-blue-900 font-medium">
                                <span>NCC: {selectedPO.supplierName}</span>
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                                  PO Đã duyệt
                                </Badge>
                              </div>
                              <p className="text-[11px] text-blue-600 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Tự động nạp {selectedPO.items?.length || 0} mặt hàng
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Warehouse Selection */}
                    <FormField
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <AdminFormLabel required>Kho nhận hàng</AdminFormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <SelectValue placeholder="-- Chọn kho nhận hàng --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((wh) => (
                                <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <AdminFormLabel>Ghi chú nhập kho</AdminFormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Nhập ghi chú chi tiết về đợt nhập hàng này..."
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

              {/* Right Column: Cost Summary (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                <FormSection
                  title="Tổng quan nhập kho"
                  description="Tóm tắt tổng số lượng và thành tiền nhập kho."
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
                        <Package size={14} className="text-blue-500" /> Tổng số lượng nhập:
                      </span>
                      <strong className="text-slate-800 font-semibold">{calculateTotalUnits()} sản phẩm</strong>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Tổng giá trị nhập kho:
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
                title="Danh sách sản phẩm nhập kho"
                description="Chọn mặt hàng, số lượng, đơn giá nhập thực tế và thông tin lô/hạn sử dụng."
              >
                {selectedPO && <p className="mb-3 text-xs text-slate-500">Phiếu đang nạp sẵn số lượng cần nhận từ đơn mua. “Đếm lại PO bằng quét mã” sẽ xoá các dòng nhập hiện tại để nhập đúng số lượng thực tế được quét.</p>}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                  <div>
                    <Button type="button" variant="outline" size="sm" className="gap-2 text-xs border-slate-300 font-medium"
                      disabled={isSubmitting || !form.watch('warehouseId')} onClick={() => setIsScannerOpen(true)}>
                      <ScanBarcode size={16} className="text-blue-600" /> Quét mã nhập kho
                    </Button>
                    {!form.watch('warehouseId') && <p className="mt-1 text-xs text-amber-700">Chọn kho nhận hàng ở tab thông tin chung trước khi quét.</p>}
                  </div>
                  {selectedPO && <Button type="button" variant="outline" size="sm" disabled={isSubmitting || !form.watch('warehouseId')}
                    onClick={() => { form.setValue('items', [], { shouldDirty: true }); setIsScannerOpen(true); }}>
                    Đếm lại PO bằng quét mã
                  </Button>}
                  <BarcodeScannerDialog open={isScannerOpen} onOpenChange={setIsScannerOpen} warehouseId={form.watch('warehouseId') || undefined} onAdd={handleScannedItem} />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ skuId: '', quantity: 1, unitCost: 0, batchCode: '', manufactureDate: '', expiryDate: '' })}
                    className="gap-1.5 border-blue-600 text-blue-600 hover:bg-blue-50 bg-white font-bold text-xs"
                  >
                    <Plus size={16} /> Thêm sản phẩm
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((fieldItem, index) => {
                    const itemQuantity = form.watch(`items.${index}.quantity`) || 0;
                    const itemUnitCost = form.watch(`items.${index}.unitCost`) || 0;
                    const itemSubtotal = itemQuantity * itemUnitCost;

                    return (
                      <div
                        key={fieldItem.id}
                        className="relative p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-4 transition-all hover:border-slate-300 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Mặt hàng #{index + 1}
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
                              title="Xóa dòng này"
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
                                        <SelectValue placeholder={isLoadingSkus ? "Đang tải SKU..." : "-- Chọn SKU sản phẩm --"} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {activeSkus.map(sku => (
                                        <SelectItem
                                          key={sku.id}
                                          value={sku.id}
                                          className="justify-center text-center [&>span]:w-full [&>span]:flex [&>span]:flex-col [&>span]:items-center"
                                        >
                                          <span className="font-medium text-slate-800">{sku.name}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">BC: {sku.barcode}</span>
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
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <AdminFormLabel required className="text-center block w-full">Số lượng</AdminFormLabel>
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

                          {/* Unit Cost */}
                          <div className="md:col-span-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitCost`}
                              render={({ field }) => (
                                <FormItem>
                                  <AdminFormLabel required className="text-center block w-full">Đơn giá nhập (VND)</AdminFormLabel>
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

                        {/* Batch & Expiry Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200/60 pt-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.batchCode`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Số lô (Batch / Lot)</AdminFormLabel>
                                <FormControl>
                                  <Input placeholder="Vd: LOT-2026-001" className="bg-white h-10 text-xs font-mono border-slate-200" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.manufactureDate`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Ngày sản xuất (NSX)</AdminFormLabel>
                                <FormControl>
                                  <DateInput type="date" className="h-10" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.expiryDate`}
                            render={({ field }) => (
                              <FormItem>
                                <AdminFormLabel>Hạn sử dụng (HSD)</AdminFormLabel>
                                <FormControl>
                                  <DateInput type="date" className="h-10" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
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
          submitDisabled={sourceLoading0 || sourceLoading1 || sourceLoading2 || Boolean(sourceError0 || sourceError1 || sourceError2)}
          submitText={initialData?.id ? 'Cập nhật phiếu nhập' : 'Lưu phiếu nhập kho'}
          activeTabLabel={tabs.find(t => t.id === activeTab)?.label}
          isDialog={isDialog}
        />
      </form>
    </Form>
  );
}
