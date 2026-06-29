'use client';

import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertOctagon, 
  DollarSign, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  X,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { 
  PageHeader, 
  DataTable, 
  DataCard, 
  Breadcrumbs,
  Badge
} from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchInput, FilterPopover, SortPopover } from '@/components/common/view-control';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface PaymentTransaction {
  id: string;
  transactionCode: string;
  customerName: string;
  orderCode: string;
  amount: number;
  paymentMethod: 'COD' | 'MOMO' | 'BANK_TRANSFER' | 'VISA';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

const initialTransactions: PaymentTransaction[] = [
  {
    id: 'txn-1',
    transactionCode: 'TXN-8819238',
    customerName: 'Nguyễn Văn A',
    orderCode: 'ORD-20260610-001',
    amount: 34990000,
    paymentMethod: 'MOMO',
    status: 'SUCCESS',
    createdAt: '2026-06-10T09:32:00Z',
  },
  {
    id: 'txn-2',
    transactionCode: 'TXN-8819202',
    customerName: 'Trần Thị B',
    orderCode: 'ORD-20260609-024',
    amount: 73980000,
    paymentMethod: 'VISA',
    status: 'SUCCESS',
    createdAt: '2026-06-09T14:20:00Z',
  },
  {
    id: 'txn-3',
    transactionCode: 'TXN-8819115',
    customerName: 'Lê Văn C',
    orderCode: 'ORD-20260608-011',
    amount: 5990000,
    paymentMethod: 'COD',
    status: 'SUCCESS',
    createdAt: '2026-06-08T10:15:00Z',
  },
  {
    id: 'txn-4',
    transactionCode: 'TXN-8819098',
    customerName: 'Phạm Minh D',
    orderCode: 'ORD-20260607-005',
    amount: 29990000,
    paymentMethod: 'BANK_TRANSFER',
    status: 'PENDING',
    createdAt: '2026-06-07T16:46:00Z',
  },
  {
    id: 'txn-5',
    transactionCode: 'TXN-8819010',
    customerName: 'Nguyễn Văn Hải',
    orderCode: 'ORD-20260605-012',
    amount: 15400000,
    paymentMethod: 'MOMO',
    status: 'FAILED',
    createdAt: '2026-06-05T08:12:00Z',
  },
  {
    id: 'txn-6',
    transactionCode: 'TXN-8818950',
    customerName: 'Trần Minh Quân',
    orderCode: 'ORD-20260604-002',
    amount: 45990000,
    paymentMethod: 'VISA',
    status: 'REFUNDED',
    createdAt: '2026-06-04T13:40:00Z',
  }
];

export default function PaymentsView() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('createdAt,desc');

  // Refund dialog state
  const [refundItem, setRefundItem] = useState<PaymentTransaction | null>(null);

  // Filters logic
  const filteredTransactions = useMemo(() => {
    let items = [...transactions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (t) =>
          t.transactionCode.toLowerCase().includes(term) ||
          t.customerName.toLowerCase().includes(term) ||
          t.orderCode.toLowerCase().includes(term)
      );
    }

    if (selectedMethod !== 'all') {
      items = items.filter((t) => t.paymentMethod === selectedMethod);
    }

    if (selectedStatus !== 'all') {
      items = items.filter((t) => t.status === selectedStatus);
    }

    // Sort logic
    const [field, direction] = sortOption.split(',');
    items.sort((a, b) => {
      const valA = a[field as keyof PaymentTransaction] as any;
      const valB = b[field as keyof PaymentTransaction] as any;

      if (typeof valA === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    return items;
  }, [transactions, searchTerm, selectedMethod, selectedStatus, sortOption]);

  // Summaries
  const stats = useMemo(() => {
    let totalSuccessVolume = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let successCount = 0;

    transactions.forEach((t) => {
      if (t.status === 'SUCCESS') {
        totalSuccessVolume += t.amount;
        successCount++;
      } else if (t.status === 'PENDING') {
        pendingCount++;
      } else if (t.status === 'FAILED') {
        failedCount++;
      }
    });

    const successRate = transactions.length > 0 
      ? Math.round((successCount / (transactions.length - pendingCount)) * 100) 
      : 100;

    return { totalSuccessVolume, pendingCount, failedCount, successRate, totalCount: transactions.length };
  }, [transactions]);

  const handleRefundSubmit = () => {
    if (!refundItem) return;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === refundItem.id) {
          return { ...t, status: 'REFUNDED' };
        }
        return t;
      })
    );

    toast.success(`Đã hoàn tất hoàn tiền giao dịch ${refundItem.transactionCode}.`);
    setRefundItem(null);
  };

  const columns = [
    {
      header: 'Mã giao dịch',
      accessorKey: 'transactionCode',
      cell: (item: PaymentTransaction) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {item.transactionCode}
        </span>
      ),
    },
    {
      header: 'Khách hàng',
      accessorKey: 'customerName',
      cell: (item: PaymentTransaction) => <span className="text-sm font-semibold text-slate-700">{item.customerName}</span>
    },
    {
      header: 'Đơn hàng',
      accessorKey: 'orderCode',
      cell: (item: PaymentTransaction) => (
        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {item.orderCode}
        </span>
      ),
    },
    {
      header: 'Phương thức',
      accessorKey: 'paymentMethod',
      cell: (item: PaymentTransaction) => (
        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500">
          {item.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : item.paymentMethod}
        </Badge>
      ),
    },
    {
      header: 'Số tiền',
      align: 'right' as const,
      cell: (item: PaymentTransaction) => (
        <span className="text-sm font-bold text-slate-900">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      header: 'Thời gian',
      accessorKey: 'createdAt',
      cell: (item: PaymentTransaction) => (
        <span className="text-[11px] text-slate-400 font-medium">
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: PaymentTransaction) => {
        const statusMap = {
          SUCCESS: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
          PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-600 border border-amber-100' },
          FAILED: { label: 'Thất bại', className: 'bg-rose-50 text-rose-600 border border-rose-100' },
          REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
        };
        const st = statusMap[item.status];
        return (
          <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border-none shadow-none px-2 py-0.5", st.className)}>
            {st.label}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: PaymentTransaction) => (
        <div className="flex justify-end gap-1">
          {item.status === 'SUCCESS' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[9px] font-bold uppercase tracking-wider gap-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
              onClick={() => setRefundItem(item)}
            >
              <RotateCcw size={10} /> Hoàn tiền
            </Button>
          )}
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: 'Giao dịch thanh toán', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Giao dịch thanh toán"
        description="Theo dõi lịch sử giao dịch tài chính, thanh toán đơn hàng và xử lý yêu cầu hoàn tiền."
      />

      {/* KPI Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tổng dòng tiền thành công</span>
            <div className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalSuccessVolume)}</div>
            <span className="text-[10px] text-slate-400 font-medium">Từ các hóa đơn thành công</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tỷ lệ thanh toán thành công</span>
            <div className="text-2xl font-black text-emerald-600">{stats.successRate}%</div>
            <span className="text-[10px] text-slate-400 font-medium">Trừ các giao dịch chờ</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Giao dịch chờ duyệt</span>
            <div className="text-2xl font-black text-amber-500">{stats.pendingCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Thanh toán đang chờ duyệt</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Giao dịch thất bại</span>
            <div className="text-2xl font-black text-red-500">{stats.failedCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Lỗi kết nối / Hủy cổng</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertOctagon size={20} />
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      <DataCard
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo mã giao dịch, đơn hàng, khách hàng..." 
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(selectedMethod !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
              onClear={() => {
                setSelectedMethod('all');
                setSelectedStatus('all');
              }}
            >
              <div className="space-y-4 p-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Cổng thanh toán</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả cổng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cổng</SelectItem>
                      <SelectItem value="COD">COD (Nhận hàng thanh toán)</SelectItem>
                      <SelectItem value="MOMO">Ví MoMo</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                      <SelectItem value="VISA">Thẻ Visa/Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái giao dịch</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="SUCCESS">Thành công</SelectItem>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="FAILED">Thất bại</SelectItem>
                      <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={[
                { value: 'createdAt,desc', label: 'Mới nhất trước' },
                { value: 'createdAt,asc', label: 'Cũ nhất trước' },
                { value: 'amount,desc', label: 'Số tiền lớn nhất' },
                { value: 'amount,asc', label: 'Số tiền nhỏ nhất' },
              ]}
              currentValue={sortOption}
              onSelect={setSortOption}
            />
          </>
        }
      >
        <DataTable
          columns={columns as any}
          data={filteredTransactions}
          emptyState={{
            title: 'Không tìm thấy giao dịch nào',
            description: 'Hãy kiểm tra lại bộ lọc hoặc thông tin tìm kiếm.',
            icon: <CreditCard className="h-10 w-10 text-slate-400" />,
            iconColor: 'bg-slate-50'
          }}
        />
      </DataCard>

      {/* Refund Confirmation Dialog */}
      <Dialog open={!!refundItem} onOpenChange={(open) => !open && setRefundItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-indigo-600" />
              Xác nhận hoàn tiền giao dịch
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hành động này sẽ thực hiện hoàn trả số tiền giao dịch lại cho khách hàng.
            </DialogDescription>
          </DialogHeader>

          {refundItem && (
            <div className="space-y-4 py-3 text-slate-700">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-1">
                <div className="text-xs font-bold font-mono text-indigo-600">{refundItem.transactionCode}</div>
                <div className="text-sm font-semibold text-slate-800">Khách hàng nhận: {refundItem.customerName}</div>
                <div className="text-sm font-semibold text-slate-800">Đơn hàng liên quan: {refundItem.orderCode}</div>
                <div className="text-sm font-black text-indigo-700 mt-2 flex items-center gap-1.5">
                  Số tiền hoàn trả: 
                  <span className="text-lg">{formatCurrency(refundItem.amount)}</span>
                </div>
              </div>

              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100/50 flex items-start gap-2 leading-relaxed">
                <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Cảnh báo:</strong> Số tiền sẽ được hoàn trả tự động qua cổng thanh toán liên kết <strong>{refundItem.paymentMethod}</strong>. Hành động này không thể đảo ngược. Vui lòng xác thực kỹ trước khi bấm xác nhận.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setRefundItem(null)}>
              Hủy bỏ
            </Button>
            <Button size="sm" onClick={handleRefundSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
              Xác nhận hoàn tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
