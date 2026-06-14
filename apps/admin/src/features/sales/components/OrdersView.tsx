'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  X,
  CreditCard,
  Edit2,
  Calendar,
  AlertCircle
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
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'COD' | 'MOMO' | 'BANK_TRANSFER' | 'VISA';
  status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const initialOrders: OrderItem[] = [
  {
    id: 'ord-1',
    orderCode: 'ORD-20260610-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    totalAmount: 34990000,
    paymentMethod: 'MOMO',
    status: 'PROCESSING',
    createdAt: '2026-06-10T09:30:00Z',
  },
  {
    id: 'ord-2',
    orderCode: 'ORD-20260609-024',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    totalAmount: 73980000,
    paymentMethod: 'VISA',
    status: 'SHIPPING',
    createdAt: '2026-06-09T14:15:00Z',
  },
  {
    id: 'ord-3',
    orderCode: 'ORD-20260608-011',
    customerName: 'Lê Văn C',
    customerPhone: '0909998887',
    totalAmount: 5990000,
    paymentMethod: 'COD',
    status: 'COMPLETED',
    createdAt: '2026-06-08T10:00:00Z',
  },
  {
    id: 'ord-4',
    orderCode: 'ORD-20260607-005',
    customerName: 'Phạm Minh D',
    customerPhone: '0888777666',
    totalAmount: 29990000,
    paymentMethod: 'BANK_TRANSFER',
    status: 'PENDING',
    createdAt: '2026-06-07T16:45:00Z',
  },
  {
    id: 'ord-5',
    orderCode: 'ORD-20260606-030',
    customerName: 'Hoàng Thị E',
    customerPhone: '0977666555',
    totalAmount: 45990000,
    paymentMethod: 'VISA',
    status: 'CANCELLED',
    createdAt: '2026-06-06T11:20:00Z',
  }
];

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [sortOption, setSortOption] = useState('createdAt,desc');

  // Status Change Dialog state
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderItem['status']>('PENDING');

  // Filters logic
  const filteredOrders = useMemo(() => {
    let items = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.customerPhone.includes(term)
      );
    }

    if (selectedStatus !== 'all') {
      items = items.filter((o) => o.status === selectedStatus);
    }

    if (selectedMethod !== 'all') {
      items = items.filter((o) => o.paymentMethod === selectedMethod);
    }

    // Sort logic
    const [field, direction] = sortOption.split(',');
    items.sort((a, b) => {
      const valA = a[field as keyof OrderItem] as any;
      const valB = b[field as keyof OrderItem] as any;

      if (typeof valA === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    return items;
  }, [orders, searchTerm, selectedStatus, selectedMethod, sortOption]);

  // Summaries
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let shippingCount = 0;
    let completedCount = 0;

    orders.forEach((o) => {
      if (o.status === 'COMPLETED') {
        totalRevenue += o.totalAmount;
        completedCount++;
      } else if (o.status === 'SHIPPING') {
        shippingCount++;
      } else if (o.status === 'PENDING' || o.status === 'PROCESSING') {
        pendingCount++;
      }
    });

    return { totalRevenue, pendingCount, shippingCount, completedCount, totalCount: orders.length };
  }, [orders]);

  const handleEditClick = (order: OrderItem) => {
    setEditingOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusSubmit = () => {
    if (!editingOrder) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === editingOrder.id) {
          return { ...o, status: newStatus };
        }
        return o;
      })
    );

    toast.success(`Đã cập nhật trạng thái đơn hàng ${editingOrder.orderCode} thành công.`);
    setEditingOrder(null);
  };

  const columns = [
    {
      header: 'Mã đơn hàng',
      accessorKey: 'orderCode',
      cell: (item: OrderItem) => (
        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {item.orderCode}
        </span>
      ),
    },
    {
      header: 'Khách hàng',
      cell: (item: OrderItem) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">{item.customerName}</span>
          <span className="text-xs text-slate-400 font-medium">{item.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Ngày đặt hàng',
      accessorKey: 'createdAt',
      cell: (item: OrderItem) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
          <Calendar size={13} className="text-slate-400" />
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      header: 'Phương thức',
      accessorKey: 'paymentMethod',
      cell: (item: OrderItem) => (
        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500">
          {item.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : item.paymentMethod}
        </Badge>
      ),
    },
    {
      header: 'Tổng tiền',
      align: 'right' as const,
      cell: (item: OrderItem) => (
        <span className="text-sm font-bold text-blue-600">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center' as const,
      cell: (item: OrderItem) => {
        const statuses = {
          PENDING: { label: 'Chờ duyệt', className: 'bg-orange-100 text-orange-700' },
          PROCESSING: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-700' },
          SHIPPING: { label: 'Đang giao', className: 'bg-sky-100 text-sky-700' },
          COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-100 text-emerald-700' },
          CANCELLED: { label: 'Đã hủy', className: 'bg-rose-100 text-rose-700' },
        };
        const st = statuses[item.status];
        return (
          <Badge className={cn("text-[10px] font-bold border-none shadow-none px-2 py-0.5", st.className)}>
            {st.label}
          </Badge>
        );
      },
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: OrderItem) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
          onClick={() => handleEditClick(item)}
        >
          <Edit2 size={14} />
        </Button>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: 'Đơn hàng', icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý đơn hàng"
        description="Theo dõi trạng thái đơn hàng, thanh toán và vận chuyển hàng hóa cho khách hàng."
      />

      {/* KPI Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Doanh thu (Đã nhận)</span>
            <div className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalRevenue)}</div>
            <span className="text-[10px] text-slate-400 font-medium">Từ {stats.completedCount} đơn hoàn thành</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Chờ xử lý</span>
            <div className="text-2xl font-black text-orange-500">{stats.pendingCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Cần duyệt & xử lý gấp</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Đang giao hàng</span>
            <div className="text-2xl font-black text-sky-500">{stats.shippingCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Đang trên đường tới khách</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tổng số lượng đơn</span>
            <div className="text-2xl font-black text-slate-800">{stats.totalCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Đơn hàng trong lịch sử</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={20} />
          </div>
        </div>
      </div>

      {/* Main Orders Table */}
      <DataCard
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..." 
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(selectedStatus !== 'all' ? 1 : 0) + (selectedMethod !== 'all' ? 1 : 0)}
              onClear={() => {
                setSelectedStatus('all');
                setSelectedMethod('all');
              }}
            >
              <div className="space-y-4 p-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái đơn hàng</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                      <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                      <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                      <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Phương thức thanh toán</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phương thức</SelectItem>
                      <SelectItem value="COD">COD (Nhận hàng thanh toán)</SelectItem>
                      <SelectItem value="MOMO">Ví MoMo</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="VISA">Thẻ Visa/Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={[
                { value: 'createdAt,desc', label: 'Mới nhất trước' },
                { value: 'createdAt,asc', label: 'Cũ nhất trước' },
                { value: 'totalAmount,desc', label: 'Giá trị cao nhất' },
                { value: 'totalAmount,asc', label: 'Giá trị thấp nhất' },
              ]}
              currentValue={sortOption}
              onSelect={setSortOption}
            />
          </>
        }
      >
        <DataTable
          columns={columns as any}
          data={filteredOrders}
          emptyState={{
            title: 'Không tìm thấy đơn hàng nào',
            description: 'Hãy thử đổi bộ lọc hoặc kiểm tra lại tên tìm kiếm.',
            icon: <ShoppingCart className="h-10 w-10 text-slate-400" />,
            iconColor: 'bg-slate-50'
          }}
        />
      </DataCard>

      {/* Change Status Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Cập nhật trạng thái đơn hàng
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thay đổi trạng thái tiến trình xử lý cho đơn hàng này.
            </DialogDescription>
          </DialogHeader>

          {editingOrder && (
            <div className="space-y-4 py-3 text-slate-700">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                <div className="text-xs font-bold font-mono text-blue-600">{editingOrder.orderCode}</div>
                <div className="text-sm font-semibold text-slate-800">Khách hàng: {editingOrder.customerName}</div>
                <div className="text-xs text-slate-500 font-medium">
                  Tổng thanh toán: <span className="font-bold text-slate-700">{formatCurrency(editingOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái mới</Label>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as any)}>
                  <SelectTrigger className="h-10 text-xs bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ duyệt (Pending)</SelectItem>
                    <SelectItem value="PROCESSING">Đang chuẩn bị hàng (Processing)</SelectItem>
                    <SelectItem value="SHIPPING">Đang giao hàng (Shipping)</SelectItem>
                    <SelectItem value="COMPLETED">Giao thành công & Đóng đơn (Completed)</SelectItem>
                    <SelectItem value="CANCELLED">Hủy đơn hàng (Cancelled)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setEditingOrder(null)}>
              Hủy bỏ
            </Button>
            <Button size="sm" onClick={handleStatusSubmit} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
