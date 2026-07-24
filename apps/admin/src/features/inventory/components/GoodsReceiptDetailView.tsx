'use client';

import React from 'react';
import { 
  PackagePlus, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  FileText, 
  UserCircle, 
  CheckCircle2, 
  XCircle,
  Clock, 
  Printer,
  Package,
  Layers
} from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatters';
import { useGoodsReceipt, useConfirmGoodsReceipt, useUpdateGoodsReceiptStatus } from '../hooks/use-goods-receipt-mutation';
import { cn } from '@/lib/utils';

interface Props {
  receiptId: string;
}

export default function GoodsReceiptDetailView({ receiptId }: Props) {
  const router = useRouter();
  const { data: receipt, isLoading } = useGoodsReceipt(receiptId);
  const confirmMutation = useConfirmGoodsReceipt();
  const updateStatusMutation = useUpdateGoodsReceiptStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Nhập kho', icon: PackagePlus, href: '/goods-receipt' },
          { label: 'Chi tiết' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Đang tải thông tin phiếu nhập kho...
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Nhập kho', icon: PackagePlus, href: '/goods-receipt' },
          { label: 'Không tìm thấy' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 space-y-4">
          <p className="text-base text-slate-700 font-bold">Không tìm thấy thông tin phiếu nhập #{receiptId}</p>
          <Button variant="outline" onClick={() => router.push('/goods-receipt')}>
            Quay lại danh sách phiếu nhập
          </Button>
        </div>
      </div>
    );
  }

  const items = receipt.items || [];
  const totalAmount = items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitCost || 0)), 0);
  const totalQuantity = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const isConfirmed = (receipt.status as string) === 'RECEIVED' || receipt.status === 'COMPLETED';
  const isCancelled = receipt.status === 'CANCELLED';

  const formattedDateString = receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString('vi-VN') : '';

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumbs items={[
        { label: 'Nhập kho', icon: PackagePlus, href: '/goods-receipt' },
        { label: receipt.receiptCode || receipt.id }
      ]} />

      <PageHeader 
        title={`Phiếu nhập kho #${receipt.receiptCode || receipt.id}`}
        description={`Ngày nhập ${formattedDateString} bởi ${receipt.createdBy || 'Hệ thống'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} className="gap-2 border-slate-300">
              <ArrowLeft size={16} /> Quay lại
            </Button>

            {!isConfirmed && !isCancelled && (
              <>
                <Button 
                  onClick={() => confirmMutation.mutate(receipt.id)} 
                  disabled={confirmMutation.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 size={16} /> {confirmMutation.isPending ? 'Đang nhập...' : 'Xác nhận nhập kho'}
                </Button>
                <Button 
                  onClick={() => updateStatusMutation.mutate({ id: receipt.id, status: 'CANCELLED' })}
                  disabled={updateStatusMutation.isPending}
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle size={16} /> Hủy phiếu
                </Button>
              </>
            )}

            <Button 
              onClick={() => window.print()} 
              variant="outline"
              className="gap-2 border-slate-300"
            >
              <Printer size={16} /> In phiếu nhập
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Summary */}
        <Card className="lg:col-span-1 border border-slate-200 shadow-sm bg-white h-fit">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-emerald-600" /> Thông tin phiếu nhập
              </CardTitle>
              <Badge className={cn(
                "text-xs border",
                ((receipt.status as string) === 'RECEIVED' || receipt.status === 'COMPLETED')
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : receipt.status === 'CANCELLED'
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              )}>
                {((receipt.status as string) === 'RECEIVED' || receipt.status === 'COMPLETED') 
                  ? 'Đã nhập kho' 
                  : receipt.status === 'CANCELLED' 
                  ? 'Đã hủy' 
                  : 'Bản nháp'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Mã phiếu nhập</span>
              <div className="font-mono font-bold text-emerald-700 text-sm">{receipt.receiptCode}</div>
            </div>

            {receipt.purchaseOrderCode && (
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">Đơn mua hàng liên quan (PO)</span>
                <div className="font-mono font-bold text-indigo-600 text-xs flex items-center gap-1.5 pt-0.5">
                  <FileText size={14} /> {receipt.purchaseOrderCode}
                </div>
              </div>
            )}

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Kho thực nhận</span>
              <div className="font-medium text-slate-800 flex items-center gap-1.5 pt-0.5">
                <Building2 size={14} className="text-emerald-600" />
                {receipt.warehouseName || 'Kho Chính'}
              </div>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Người thực hiện</span>
              <div className="font-medium text-slate-700 flex items-center gap-1.5 pt-0.5">
                <UserCircle size={14} className="text-slate-500" />
                {receipt.createdBy || 'Thủ kho'}
              </div>
            </div>

            {receipt.note && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Ghi chú</span>
                <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  &quot;{receipt.note}&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goods Receipt Items Table */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">Danh sách sản phẩm nhập kho</CardTitle>
            <CardDescription className="text-xs">Chi tiết thực tế kiểm đếm {items.length} mặt hàng nhập vào kho</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Sản phẩm (SKU)</th>
                    <th className="py-2.5 px-3 text-center">Số lô / NSX / HSD</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá nhập</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.skuName || item.skuId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU ID: {item.skuId}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-slate-700">{item.batchCode || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400">
                            {item.manufactureDate ? `NSX: ${item.manufactureDate}` : ''} 
                            {item.expiryDate ? ` | HSD: ${item.expiryDate}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.unitCost)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(Number(item.quantity || 0) * Number(item.unitCost || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Số mặt hàng:</span>
                  <span className="font-semibold text-slate-700">{items.length} SKU</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tổng số lượng nhập:</span>
                  <span className="font-semibold text-slate-700">{totalQuantity} sản phẩm</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Tổng giá trị nhập kho:</span>
                  <span className="text-emerald-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
