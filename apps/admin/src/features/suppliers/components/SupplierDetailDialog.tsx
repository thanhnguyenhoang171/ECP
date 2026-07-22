'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DetailDialog } from '@/components/common';
import { ClientSupplier } from '@/lib/clientDb';
import { useSupplier } from '../hooks/use-suppliers';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface SupplierDetailDialogProps {
  supplierId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SupplierDetailDialog({
  supplierId,
  open,
  onOpenChange,
}: SupplierDetailDialogProps) {
  const activeId = open && supplierId ? supplierId : '';
  const { data: supplier, isLoading, isError } = useSupplier(activeId);

  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Không thể tải thông tin nhà cung cấp từ máy chủ."
      createdAt={(supplier as any)?.createdAt}
      updatedAt={(supplier as any)?.updatedAt}
      header={{
        icon: Building2,
        title: supplier?.name,
        subtitle: `MST: ${supplier?.taxCode || 'Chưa cập nhật'}`,
        badge: supplier ? (
          <Badge 
            className={
              supplier.isActive 
                ? "bg-blue-100 text-blue-700 border-none shrink-0 px-3 py-1 text-xs font-semibold" 
                : "bg-slate-100 text-slate-500 border-none shrink-0 px-3 py-1 text-xs font-semibold"
            }
          >
            {supplier.isActive ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đang hợp tác
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Tạm ngưng
              </span>
            )}
          </Badge>
        ) : null
      }}
      sections={[
        {
          title: "Thông tin liên hệ",
          items: [
            { label: "Người liên hệ", value: supplier?.contactName, icon: User },
            { label: "Số điện thoại", value: supplier?.phone, icon: Phone },
            { label: "Email", value: supplier?.email, icon: Mail },
          ]
        },
        {
          title: "Địa chỉ & Pháp lý",
          items: [
            { label: "Địa chỉ trụ sở", value: supplier?.address, icon: MapPin },
            { label: "Mã số thuế", value: supplier?.taxCode, icon: FileText, fontMono: true },
          ]
        }
      ]}
    />
  );
}
