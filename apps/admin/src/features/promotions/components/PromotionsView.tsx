'use client';

import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingDown,
  Percent,
  Coins,
  Truck
} from 'lucide-react';
import { 
  PageHeader, 
  DataTable, 
  Badge,
  DataCard,
  StatsCard,
  NextPagination
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Promotion, PromotionStatus } from '../types/promotion.interface';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PromotionsView() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data
  const promotions: Promotion[] = [
    {
      id: '1',
      code: 'SUMMER2026',
      name: 'Khuyến mãi Hè Rực Rỡ',
      description: 'Giảm 10% cho tất cả đơn hàng từ 1 triệu đồng',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 1000000,
      maxDiscountAmount: 500000,
      usageLimit: 100,
      usedCount: 45,
      startDate: '2026-06-01T00:00:00Z',
      endDate: '2026-08-31T23:59:59Z',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      code: 'FREESHIP66',
      name: 'Săn Deal 6/6 FreeShip',
      description: 'Miễn phí vận chuyển toàn quốc',
      type: 'FREE_SHIPPING',
      value: 30000,
      minOrderAmount: 200000,
      usageLimit: 500,
      usedCount: 500,
      startDate: '2026-06-06T00:00:00Z',
      endDate: '2026-06-06T23:59:59Z',
      status: 'EXPIRED',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      code: 'HELLO_NEW',
      name: 'Chào mừng thành viên mới',
      description: 'Giảm trực tiếp 50k cho đơn hàng đầu tiên',
      type: 'FIXED_AMOUNT',
      value: 50000,
      usageLimit: 1000,
      usedCount: 120,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
  ];

  const getStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" className="gap-1"><CheckCircle2 size={12} /> Đang chạy</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary" className="gap-1"><Clock size={12} /> Hết hạn</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 gap-1"><Calendar size={12} /> Chờ chạy</Badge>;
      default:
        return <Badge variant="destructive" className="gap-1"><XCircle size={12} /> Tạm dừng</Badge>;
    }
  };

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent size={14} className="text-indigo-600" />;
      case 'FIXED_AMOUNT': return <Coins size={14} className="text-amber-600" />;
      case 'FREE_SHIPPING': return <Truck size={14} className="text-emerald-600" />;
    }
  };

  const columns = [
    {
      header: 'Mã & Chương trình',
      accessorKey: 'code',
      cell: (promo: Promotion) => (
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl shrink-0",
            promo.type === 'PERCENTAGE' ? "bg-indigo-50" : promo.type === 'FIXED_AMOUNT' ? "bg-amber-50" : "bg-emerald-50"
          )}>
            <Ticket size={18} className={cn(
               promo.type === 'PERCENTAGE' ? "text-indigo-600" : promo.type === 'FIXED_AMOUNT' ? "text-amber-600" : "text-emerald-600"
            )} />
          </div>
          <div className="space-y-0.5">
            <div className="font-black text-slate-900 tracking-tight flex items-center gap-2">
              {promo.code}
              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1 rounded">VOUCHER</span>
            </div>
            <div className="text-xs font-medium text-slate-500">{promo.name}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Giá trị',
      accessorKey: 'value',
      cell: (promo: Promotion) => (
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          {getTypeIcon(promo.type)}
          {promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatCurrency(promo.value)}
        </div>
      )
    },
    {
      header: 'Đã dùng',
      accessorKey: 'usedCount',
      cell: (promo: Promotion) => (
        <div className="space-y-1.5 w-32">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-500">{promo.usedCount} lượt</span>
            <span className="text-slate-400">/ {promo.usageLimit || '∞'}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                (promo.usedCount / (promo.usageLimit || 1)) > 0.9 ? "bg-rose-500" : "bg-indigo-500"
              )} 
              style={{ width: `${Math.min(100, (promo.usedCount / (promo.usageLimit || 1)) * 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Thời gian',
      accessorKey: 'endDate',
      cell: (promo: Promotion) => (
        <div className="text-xs text-slate-500">
          <div>Từ: {formatDate(promo.startDate)}</div>
          <div>Đến: {formatDate(promo.endDate)}</div>
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (promo: Promotion) => getStatusBadge(promo.status)
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={18} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Khuyến mãi"
        breadcrumbs={[
          { label: 'Tiếp thị', href: '/promotions' },
          { label: 'Mã giảm giá', active: true }
        ]}
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            <Plus size={18} className="mr-2" /> Tạo mã giảm giá
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Đang hoạt động"
          value={promotions.filter(p => p.status === 'ACTIVE').length}
          icon={<Ticket />}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          description="Chương trình đang chạy"
        />
        <StatsCard
          title="Tổng lượt sử dụng"
          value="665"
          trend="up"
          icon={<TrendingDown />}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
          description="+12% so với tháng trước"
        />
        <StatsCard
          title="Voucher sắp hết"
          value="2"
          icon={<AlertCircle />}
          color="bg-rose-50 text-rose-600 border-rose-100"
          description="Đã dùng trên 90% số lượng"
        />
      </div>

      <DataCard
        search={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã hoặc tên chương trình..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      >
        <DataTable 
          columns={columns} 
          data={promotions} 
        />
      </DataCard>
    </div>
  );
}
