'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Save, X, Package, Calculator, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/common';
import { goodsReceiptSchema, GoodsReceiptFormValues } from '../schemas/goods-receipt.schema';
import { toast } from 'sonner';

// Mock data for Selects
const mockWarehouses = [
  { id: 'wh-1', name: 'Kho Chính Quận 1' },
  { id: 'wh-2', name: 'Kho Phụ Quận 7' },
];

const mockSkus = [
  { id: 'sku-1', name: 'iPhone 15 Pro Max - Titan - 256GB', price: 28000000 },
  { id: 'sku-2', name: 'Samsung Galaxy S24 Ultra - Black - 512GB', price: 26000000 },
];

export default function GoodsReceiptForm() {
  const router = useRouter();

  const form = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
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

  async function onSubmit(values: GoodsReceiptFormValues) {
    console.log('Form values:', values);
    toast.success('Đã lưu thông tin nhập kho thành công (Demo)');
    router.push('/goods-receipt');
  }

  const calculateTotal = () => {
    return form.watch('items').reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Tạo phiếu nhập kho"
        description="Điền thông tin hàng hóa nhập kho thực tế."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <X size={18} />
              Hủy bỏ
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} className="gap-2 shadow-lg shadow-primary/20">
              <Save size={18} />
              Lưu phiếu nhập
            </Button>
          </div>
        }
      />

      <Form {...form}>
        <form className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* General Info */}
            <Card className="lg:col-span-1 h-fit shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                  <Package size={20} className="text-primary" />
                  Thông tin chung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="receiptCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Mã phiếu nhập</FormLabel>
                      <FormControl>
                        <Input placeholder="Để trống để tự động tạo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Kho nhập <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kho hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockWarehouses.map(wh => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Đơn mua hàng (PO)</FormLabel>
                      <FormControl>
                        <Input placeholder="Mã đơn mua hàng nếu có" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-slate-500">Ghi chú</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />
                
                <div className="bg-slate-900 rounded-xl p-4 text-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-xs font-bold uppercase">Tổng giá trị</span>
                    <Calculator size={14} className="text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-primary-foreground">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items List */}
            <Card className="lg:col-span-2 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-700">Danh sách sản phẩm</CardTitle>
                  <CardDescription>Thêm các mặt hàng thực tế nhập vào kho</CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ skuId: '', quantity: 1, unitCost: 0, batchCode: '', manufactureDate: '', expiryDate: '' })}
                  className="gap-2 border-primary text-primary hover:bg-primary/5"
                >
                  <Plus size={16} /> Thêm dòng
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4 group">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                          <FormField
                            control={form.control}
                            name={`items.${index}.skuId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Sản phẩm (SKU)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Chọn SKU" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {mockSkus.map(sku => (
                                      <SelectItem key={sku.id} value={sku.id}>{sku.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Số lượng</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    className="bg-white"
                                    {...field} 
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Đơn giá nhập</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    className="bg-white text-right"
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end justify-center">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)}
                            className="text-slate-400 hover:text-destructive transition-colors"
                            disabled={fields.length === 1}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.batchCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase text-slate-400">Số lô (Batch)</FormLabel>
                              <FormControl>
                                <Input placeholder="Vd: L0526" className="bg-white h-8 text-xs" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.manufactureDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                <Calendar size={10} /> NSX
                              </FormLabel>
                              <FormControl>
                                <Input type="date" className="bg-white h-8 text-xs" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.expiryDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                <Calendar size={10} /> HSD
                              </FormLabel>
                              <FormControl>
                                <Input type="date" className="bg-white h-8 text-xs" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
