'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientSupplier } from '@/lib/clientDb';
import { useSupplier } from '../hooks/use-suppliers';
import { formatDate } from '@/lib/formatters';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';

interface SupplierDetailDialogProps {
  supplierId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (supplier: ClientSupplier) => void;
}

export default function SupplierDetailDialog({
  supplierId,
  open,
  onOpenChange,
  onEdit,
}: SupplierDetailDialogProps) {
  const activeId = open && supplierId ? supplierId : '';
  const { data: supplier, isLoading, isError } = useSupplier(activeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-6">
        <DialogHeader className="pr-10 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {isLoading ? 'Đang tải thông tin...' : (supplier?.name || 'Chi tiết nhà cung cấp')}
                </DialogTitle>
                {!isLoading && supplier && (
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
                )}
              </div>
              <DialogDescription className="text-xs sm:text-sm text-slate-500">
                {!isLoading && supplier 
                  ? `MST: ${supplier.taxCode || 'Chưa cập nhật'}` 
                  : 'Xem chi tiết thông tin đối tác và hợp tác.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
        ) : isError || !supplier ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-medium text-slate-700">Không thể tải thông tin nhà cung cấp từ máy chủ.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
              {/* Thông tin liên hệ */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Thông tin liên hệ</h4>
                <div className="space-y-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Người liên hệ</span>
                      <span className="text-sm font-semibold text-slate-700 truncate">{supplier.contactName || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Số điện thoại</span>
                      <span className="text-sm font-semibold text-slate-700 truncate">{supplier.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Email</span>
                      <span className="text-sm font-semibold text-slate-700 truncate">{supplier.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Địa chỉ & Pháp lý */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Địa chỉ & Pháp lý</h4>
                <div className="space-y-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Địa chỉ trụ sở</span>
                      <span className="text-sm font-medium text-slate-700 leading-normal">{supplier.address || 'Chưa có thông tin địa chỉ'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Mã số thuế</span>
                      <span className="text-sm font-mono font-semibold text-slate-700">{supplier.taxCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thời gian hệ thống */}
              <div className="space-y-3 md:col-span-2">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Thời gian hệ thống</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Ngày tạo</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatDate((supplier as any).createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Cập nhật lần cuối</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatDate((supplier as any).updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {onEdit && (
              <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-4 h-9"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(supplier);
                  }}
                >
                  <Edit2 className="w-4 h-4" /> Chỉnh sửa thông tin
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
