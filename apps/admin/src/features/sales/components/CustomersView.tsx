'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Award, 
  DollarSign, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  X,
  Calendar,
  Mail,
  Phone,
  Edit,
  Eye
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

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  rank: 'NORMAL' | 'SILVER' | 'GOLD' | 'VIP';
  totalSpend: number;
  ordersCount: number;
  joinedAt: string;
}

const initialCustomers: CustomerItem[] = [
  {
    id: 'cust-1',
    name: 'Nguyễn Thị Hạnh',
    email: 'hanhnguyen@gmail.com',
    phone: '0983123456',
    rank: 'VIP',
    totalSpend: 124500000,
    ordersCount: 8,
    joinedAt: '2025-01-15T08:30:00Z',
  },
  {
    id: 'cust-2',
    name: 'Lê Hoàng Long',
    email: 'longle@yahoo.com',
    phone: '0912445566',
    rank: 'GOLD',
    totalSpend: 48900000,
    ordersCount: 4,
    joinedAt: '2025-03-10T11:20:00Z',
  },
  {
    id: 'cust-3',
    name: 'Phan Minh Trí',
    email: 'triphan99@hotmail.com',
    phone: '0905112233',
    rank: 'SILVER',
    totalSpend: 15400000,
    ordersCount: 2,
    joinedAt: '2025-05-02T14:45:00Z',
  },
  {
    id: 'cust-4',
    name: 'Vũ Quốc Anh',
    email: 'quocanhvu@outlook.com',
    phone: '0888123987',
    rank: 'NORMAL',
    totalSpend: 5990000,
    ordersCount: 1,
    joinedAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'cust-5',
    name: 'Ngô Bảo Châu',
    email: 'chaungo.math@gmail.com',
    phone: '0977222333',
    rank: 'VIP',
    totalSpend: 210500000,
    ordersCount: 12,
    joinedAt: '2024-11-20T10:15:00Z',
  }
];

export default function CustomersView() {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('all');
  const [sortOption, setSortOption] = useState('totalSpend,desc');

  // Rank Edit Dialog state
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [newRank, setNewRank] = useState<CustomerItem['rank']>('NORMAL');

  // Filters logic
  const filteredCustomers = useMemo(() => {
    let items = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term)
      );
    }

    if (selectedRank !== 'all') {
      items = items.filter((c) => c.rank === selectedRank);
    }

    // Sort logic
    const [field, direction] = sortOption.split(',');
    items.sort((a, b) => {
      const valA = a[field as keyof CustomerItem] as any;
      const valB = b[field as keyof CustomerItem] as any;

      if (typeof valA === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    return items;
  }, [customers, searchTerm, selectedRank, sortOption]);

  // Summaries
  const stats = useMemo(() => {
    let vipCount = 0;
    let totalSpentSum = 0;
    let activeInMonth = 0;

    customers.forEach((c) => {
      totalSpentSum += c.totalSpend;
      if (c.rank === 'VIP') {
        vipCount++;
      }
      if (c.ordersCount > 3) {
        activeInMonth++;
      }
    });

    const averageLTV = customers.length > 0 ? totalSpentSum / customers.length : 0;

    return { totalCustomers: customers.length, vipCount, averageLTV, activeInMonth };
  }, [customers]);

  const handleEditClick = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setNewRank(customer.rank);
  };

  const handleRankSubmit = () => {
    if (!editingCustomer) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === editingCustomer.id) {
          return { ...c, rank: newRank };
        }
        return c;
      })
    );

    toast.success(`Đã nâng cấp/chỉnh sửa hạng khách hàng ${editingCustomer.name} thành công.`);
    setEditingCustomer(null);
  };

  const columns = [
    {
      header: 'Khách hàng',
      cell: (item: CustomerItem) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100/80 text-blue-600 font-black flex items-center justify-center text-sm shadow-sm border border-blue-200/50">
            {item.name.split(' ').pop()?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{item.name}</span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Mail size={11} className="text-slate-300" />
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Điện thoại',
      accessorKey: 'phone',
      cell: (item: CustomerItem) => (
        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 font-mono">
          <Phone size={11} className="text-slate-400" />
          {item.phone}
        </span>
      ),
    },
    {
      header: 'Hạng thành viên',
      accessorKey: 'rank',
      align: 'center' as const,
      cell: (item: CustomerItem) => {
        const ranks = {
          NORMAL: { label: 'Thành viên', className: 'bg-slate-100 text-slate-700' },
          SILVER: { label: 'Bạc', className: 'bg-zinc-100 text-zinc-600 border border-zinc-200' },
          GOLD: { label: 'Vàng', className: 'bg-amber-50 text-amber-600 border border-amber-200' },
          VIP: { label: 'VIP Kim cương', className: 'bg-purple-100 text-purple-700 font-black' },
        };
        const r = ranks[item.rank];
        return (
          <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border-none shadow-none px-2 py-0.5", r.className)}>
            {r.label}
          </Badge>
        );
      },
    },
    {
      header: 'Số đơn hàng',
      accessorKey: 'ordersCount',
      align: 'center' as const,
      cell: (item: CustomerItem) => (
        <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
          {item.ordersCount} đơn
        </span>
      ),
    },
    {
      header: 'Tổng chi tiêu',
      align: 'right' as const,
      cell: (item: CustomerItem) => (
        <span className="text-sm font-black text-slate-800">
          {formatCurrency(item.totalSpend)}
        </span>
      ),
    },
    {
      header: 'Ngày gia nhập',
      accessorKey: 'joinedAt',
      cell: (item: CustomerItem) => (
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Calendar size={12} className="text-slate-300" />
          {new Date(item.joinedAt).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: CustomerItem) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            onClick={() => handleEditClick(item)}
          >
            <Edit size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: 'Khách hàng', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý khách hàng"
        description="Quản lý danh sách người mua hàng, hạng thành viên VIP và tổng doanh thu tích lũy từ khách hàng."
      />

      {/* KPI Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tổng số khách hàng</span>
            <div className="text-2xl font-black text-slate-800">{stats.totalCustomers}</div>
            <span className="text-[10px] text-slate-400 font-medium">Tài khoản mua hàng</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Khách hàng VIP</span>
            <div className="text-2xl font-black text-purple-600">{stats.vipCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Tỷ lệ LTV cực cao</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">LTV trung bình</span>
            <div className="text-2xl font-black text-emerald-600">{formatCurrency(stats.averageLTV)}</div>
            <span className="text-[10px] text-slate-400 font-medium">Chi tiêu trên mỗi khách</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Người mua trung thành</span>
            <div className="text-2xl font-black text-slate-800">{stats.activeInMonth}</div>
            <span className="text-[10px] text-slate-400 font-medium">Đã mua trên 3 đơn hàng</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserPlus size={20} />
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <DataCard
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo tên, email hoặc số điện thoại..." 
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={selectedRank !== 'all' ? 1 : 0}
              onClear={() => setSelectedRank('all')}
            >
              <div className="space-y-2 p-1">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Hạng khách hàng</Label>
                <Select value={selectedRank} onValueChange={setSelectedRank}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tất cả hạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả hạng</SelectItem>
                    <SelectItem value="NORMAL">Thành viên thường</SelectItem>
                    <SelectItem value="SILVER">Thành viên Bạc</SelectItem>
                    <SelectItem value="GOLD">Thành viên Vàng</SelectItem>
                    <SelectItem value="VIP">Thành viên VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FilterPopover>

            <SortPopover
              options={[
                { value: 'totalSpend,desc', label: 'Chi tiêu giảm dần' },
                { value: 'totalSpend,asc', label: 'Chi tiêu tăng dần' },
                { value: 'ordersCount,desc', label: 'Số đơn hàng giảm dần' },
                { value: 'joinedAt,desc', label: 'Mới gia nhập' },
              ]}
              currentValue={sortOption}
              onSelect={setSortOption}
            />
          </>
        }
      >
        <DataTable
          columns={columns as any}
          data={filteredCustomers}
          emptyState={{
            title: 'Không tìm thấy khách hàng nào',
            description: 'Hãy kiểm tra lại thông tin lọc hoặc thanh tìm kiếm.',
            icon: <Users className="h-10 w-10 text-slate-400" />,
            iconColor: 'bg-slate-50'
          }}
        />
      </DataCard>

      {/* Edit Rank Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Chỉnh sửa hạng thành viên
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thay đổi hạng thành viên và các ưu đãi tương ứng cho khách hàng.
            </DialogDescription>
          </DialogHeader>

          {editingCustomer && (
            <div className="space-y-4 py-3 text-slate-700">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                <div className="text-sm font-bold text-slate-800">{editingCustomer.name}</div>
                <div className="text-xs text-slate-500 font-medium">Email: {editingCustomer.email}</div>
                <div className="text-xs text-slate-500 font-medium">
                  Tổng chi tiêu tích lũy: <span className="font-bold text-blue-600">{formatCurrency(editingCustomer.totalSpend)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Hạng mới</Label>
                <Select value={newRank} onValueChange={(val) => setNewRank(val as any)}>
                  <SelectTrigger className="h-10 text-xs bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Thành viên thường (Normal)</SelectItem>
                    <SelectItem value="SILVER">Thành viên Bạc (Silver)</SelectItem>
                    <SelectItem value="GOLD">Thành viên Vàng (Gold)</SelectItem>
                    <SelectItem value="VIP">Khách hàng VIP (Diamond/VIP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setEditingCustomer(null)}>
              Hủy bỏ
            </Button>
            <Button size="sm" onClick={handleRankSubmit} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
