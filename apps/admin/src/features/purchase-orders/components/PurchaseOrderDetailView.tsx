'use client';

import React from 'react';
import { 
  FileText, 
  PackagePlus, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Edit,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatters';

import { usePurchaseOrder, useUpdatePOStatus } from '../hooks/use-purchase-order-mutation';

interface Props {
  poId: string;
}

interface POItemDetail {
  id: string;
  skuCode: string;
  skuName: string;
  orderedQuantity: number;
  unitPrice: number;
}

export default function PurchaseOrderDetailView({ poId }: Props) {
  const router = useRouter();
  const { data: poResponse, isLoading } = usePurchaseOrder(poId);
  const updateStatusMutation = useUpdatePOStatus();

  const poDetail = React.useMemo(() => {
    if (poResponse) {
      const p = poResponse as any;
      const items: POItemDetail[] = (p.items || []).map((it: any, idx: number) => ({
        id: it.id || String(idx + 1),
        skuCode: it.skuCode || it.sku?.skuCode || it.skuId || `SKU-${idx + 1}`,
        skuName: it.skuName || it.sku?.productName || it.name || `Sản phẩm #${idx + 1}`,
        orderedQuantity: Number(it.orderQuantity || it.orderedQuantity || it.quantity || 1),
        unitPrice: Number(it.unitPrice || 0)
      }));

      return {
        id: p.id || poId,
        code: p.code || p.poCode || `PO-${p.id}`,
        supplierName: p.supplierName || p.supplier?.name || 'Nhà cung cấp',
        supplierCode: p.supplierCode || p.supplier?.code || 'N/A',
        supplierPhone: p.supplierPhone || p.supplier?.phone || 'N/A',
        supplierEmail: p.supplierEmail || p.supplier?.email || 'N/A',
        warehouseName: p.warehouseName || p.warehouse?.name || 'Kho nhận hàng',
        status: p.status || 'APPROVED',
        expectedDeliveryDate: p.expectedDeliveryDate || new Date().toISOString(),
        createdAt: p.createdAt || new Date().toISOString(),
        createdBy: p.createdBy || 'Quản trị viên',
        note: p.note || '',
        items
      };
    }
    return null;
  }, [poResponse, poId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
          { label: 'Chi tiết' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
          Đang tải thông tin chi tiết Đơn mua hàng (PO)...
        </div>
      </div>
    );
  }

  if (!poDetail) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
          { label: 'Không tìm thấy' }
        ]} />
        <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200 space-y-4">
          <p className="text-base text-slate-700 font-bold">Không tìm thấy thông tin đơn mua hàng #{poId}</p>
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            Quay lại danh sách PO
          </Button>
        </div>
      </div>
    );
  }

  const items = poDetail?.items || [];
  const totalAmount = items.reduce((acc: number, item: POItemDetail) => acc + ((item.orderedQuantity || 0) * (item.unitPrice || 0)), 0);
  const isDraft = poDetail.status === 'DRAFT' || poDetail.status === 'PENDING';
  const isOrdered = poDetail.status === 'ORDERED' || poDetail.status === 'APPROVED';
  const isPartial = poDetail.status === 'PARTIALLY_RECEIVED';
  const isCompleted = poDetail.status === 'COMPLETED';
  const isCancelled = poDetail.status === 'CANCELLED';

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumbs items={[
        { label: 'Đơn mua hàng', icon: FileText, href: '/purchase-orders' },
        { label: poDetail.code }
      ]} />

      <PageHeader 
        title={`Đơn mua hàng #${poDetail.code}`}
        description={`Lập ngày ${new Date(poDetail.createdAt).toLocaleDateString('vi-VN')} bởi ${poDetail.createdBy}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()} className="gap-2 border-slate-300">
              <ArrowLeft size={16} /> Quay lại
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/purchase-orders/${poDetail.id}/edit`)} 
              className="gap-2 border-slate-300"
            >
              <Edit size={16} /> Chỉnh sửa đơn PO
            </Button>

            {isDraft && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ id: poDetail.id, status: 'ORDERED' })} 
                disabled={updateStatusMutation.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 size={16} /> Xác nhận đặt hàng (ORDERED)
              </Button>
            )}

            {(isOrdered || isPartial) && (
              <>
                <Button 
                  onClick={() => router.push(`/goods-receipt/new?poId=${poDetail.id}`)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                >
                  <PackagePlus size={18} /> Tạo phiếu nhập kho từ PO
                </Button>
                <Button 
                  onClick={() => updateStatusMutation.mutate({ id: poDetail.id, status: 'COMPLETED' })} 
                  disabled={updateStatusMutation.isPending}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 size={16} /> Đánh dấu hoàn thành
                </Button>
              </>
            )}

            {!isCancelled && !isCompleted && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ id: poDetail.id, status: 'CANCELLED' })} 
                disabled={updateStatusMutation.isPending}
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} /> Hủy đơn PO
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO General Summary */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">Thông tin chung PO</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Đã phê duyệt
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="space-y-2 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Nhà cung cấp</span>
              <div className="font-semibold text-slate-800 text-sm">{poDetail.supplierName}</div>
              <div className="text-slate-500 font-mono text-[11px]">Mã NCC: {poDetail.supplierCode}</div>
              <div className="text-slate-500">SĐT: {poDetail.supplierPhone}</div>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Địa điểm nhận hàng</span>
              <div className="font-medium text-slate-700 flex items-center gap-1.5 pt-0.5">
                <Building2 size={14} className="text-emerald-600" />
                {poDetail.warehouseName}
              </div>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Ngày giao hàng dự kiến</span>
              <div className="font-medium text-slate-700 flex items-center gap-1.5 pt-0.5">
                <Calendar size={14} className="text-amber-600" />
                {new Date(poDetail.expectedDeliveryDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            {poDetail.note && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Ghi chú PO</span>
                <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  &quot;{poDetail.note}&quot;
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PO Items Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">Danh sách sản phẩm mua hàng</CardTitle>
            <CardDescription className="text-xs">Chi tiết {poDetail.items.length} mặt hàng đặt từ Nhà cung cấp</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Sản phẩm (SKU)</th>
                    <th className="py-2.5 px-3 text-center">Số lượng</th>
                    <th className="py-2.5 px-3 text-right">Giá đặt mua</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {poDetail.items.map((item: POItemDetail, index: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.skuName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.skuCode}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{item.orderedQuantity}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                        {formatCurrency(item.orderedQuantity * item.unitPrice)}
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
                  <span>Tổng số mặt hàng:</span>
                  <span className="font-semibold text-slate-700">{poDetail.items.length} SKU</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tổng số sản phẩm đặt:</span>
                  <span className="font-semibold text-slate-700">
                    {poDetail.items.reduce((a: number, b: POItemDetail) => a + b.orderedQuantity, 0)} sản phẩm
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Tổng tiền mua:</span>
                  <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
