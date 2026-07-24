'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DetailDialog, DetailSection } from '@/components/common';
import { useWarehouse } from '../hooks/use-warehouses';
import { 
  Warehouse, 
  Hash, 
  MapPin, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface WarehouseDetailDialogProps {
  warehouseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WarehouseDetailDialog({
  warehouseId,
  open,
  onOpenChange,
}: WarehouseDetailDialogProps) {
  const activeId = open && warehouseId ? warehouseId : '';
  const { data: warehouse, isLoading, isError } = useWarehouse(activeId);

  const sections: DetailSection[] = [
    {
      title: "Thông tin cơ bản kho bãi",
      cols: 2,
      items: [
        { label: "Tên kho bãi", value: warehouse?.name, icon: Warehouse },
        { label: "Mã định danh kho", value: warehouse?.code, icon: Hash, fontMono: true },
        { label: "Địa chỉ trụ sở/vị trí", value: warehouse?.address || 'Chưa cập nhật địa chỉ', icon: MapPin, colSpan: 2 },
        { label: "Mã ID kho", value: warehouse?.id, icon: Hash, fontMono: true, colSpan: 2 },
      ]
    }
  ];

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Không thể tải thông tin kho bãi từ máy chủ."
      createdAt={(warehouse as any)?.createdAt}
      updatedAt={(warehouse as any)?.updatedAt}
      header={{
        icon: Warehouse,
        title: warehouse?.name,
        subtitle: `Mã kho: ${warehouse?.code || 'N/A'}`,
        badge: warehouse ? (
          <Badge 
            className={
              warehouse.isActive 
                ? "bg-emerald-100 text-emerald-700 border-none shrink-0 px-3 py-1 text-xs font-semibold" 
                : "bg-slate-100 text-slate-500 border-none shrink-0 px-3 py-1 text-xs font-semibold"
            }
          >
            {warehouse.isActive ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đang hoạt động
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Ngừng hoạt động
              </span>
            )}
          </Badge>
        ) : null
      }}
      sections={sections}
    />
  );
}
