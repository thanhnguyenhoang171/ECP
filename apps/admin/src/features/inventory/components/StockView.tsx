'use client';

import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Warehouse, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Info
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchInput, FilterPopover, SortPopover } from '@/components/common/view-control';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface StockItem {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  warehouseId: string;
  warehouseName: string;
  stock: number;
  lowStockThreshold: number;
  costPrice: number;
  price: number;
}

const initialStockData: StockItem[] = [
  {
    id: 'st-1',
    sku: 'IP15PM-TITAN-256',
    productName: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 25,
    lowStockThreshold: 5,
    costPrice: 26500000,
    price: 34990000,
  },
  {
    id: 'st-2',
    sku: 'IP15PM-TITAN-256-Q7',
    productName: 'iPhone 15 Pro Max',
    variantName: 'Titan tự nhiên / 256GB',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 3,
    lowStockThreshold: 5,
    costPrice: 26500000,
    price: 34990000,
  },
  {
    id: 'st-3',
    sku: 'MBP14-M3-SILVER',
    productName: 'MacBook Pro 14 M3',
    variantName: 'Silver / M3 / 16GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 8,
    lowStockThreshold: 3,
    costPrice: 38000000,
    price: 45990000,
  },
  {
    id: 'st-4',
    sku: 'S24-ULTRA-BLACK-512',
    productName: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 0,
    lowStockThreshold: 4,
    costPrice: 22000000,
    price: 29990000,
  },
  {
    id: 'st-5',
    sku: 'S24-ULTRA-BLACK-512-Q1',
    productName: 'Samsung Galaxy S24 Ultra',
    variantName: 'Titanium Black / 512GB',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Chính Quận 1',
    stock: 12,
    lowStockThreshold: 4,
    costPrice: 22000000,
    price: 29990000,
  },
  {
    id: 'st-6',
    sku: 'AIRPODS-GEN2',
    productName: 'AirPods Pro Gen 2',
    variantName: 'White / Type-C',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Phụ Quận 7',
    stock: 48,
    lowStockThreshold: 10,
    costPrice: 4200000,
    price: 5990000,
  }
];

export default function StockView() {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('sku,asc');

  // Adjustment Modal state
  const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('check');

  // Filters logic
  const filteredItems = useMemo(() => {
    let items = [...stockItems];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term)
      );
    }

    if (selectedWarehouse !== 'all') {
      items = items.filter((item) => item.warehouseId === selectedWarehouse);
    }

    if (selectedStatus !== 'all') {
      items = items.filter((item) => {
        if (selectedStatus === 'low') {
          return item.stock > 0 && item.stock <= item.lowStockThreshold;
        }
        if (selectedStatus === 'out') {
          return item.stock === 0;
        }
        if (selectedStatus === 'ok') {
          return item.stock > item.lowStockThreshold;
        }
        return true;
      });
    }

    // Sort logic
    const [field, direction] = sortOption.split(',');
    items.sort((a, b) => {
      const valA = a[field as keyof StockItem] as any;
      const valB = b[field as keyof StockItem] as any;

      if (typeof valA === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return direction === 'asc' ? valA - valB : valB - valA;
    });

    return items;
  }, [stockItems, searchTerm, selectedWarehouse, selectedStatus, sortOption]);

  // Statistics summaries
  const stats = useMemo(() => {
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    stockItems.forEach((item) => {
      totalStock += item.stock;
      totalValue += item.stock * item.costPrice;
      if (item.stock === 0) {
        outOfStockCount++;
      } else if (item.stock <= item.lowStockThreshold) {
        lowStockCount++;
      }
    });

    return { totalStock, totalValue, lowStockCount, outOfStockCount };
  }, [stockItems]);

  const handleAdjustClick = (item: StockItem) => {
    setAdjustingItem(item);
    setAdjustType('add');
    setAdjustQty(0);
    setAdjustReason('check');
  };

  const handleAdjustSubmit = () => {
    if (!adjustingItem) return;

    if (adjustQty < 0) {
      toast.error('Số lượng điều chỉnh không thể âm');
      return;
    }

    setStockItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === adjustingItem.id) {
          let newStock = item.stock;
          if (adjustType === 'add') {
            newStock += adjustQty;
          } else if (adjustType === 'subtract') {
            newStock = Math.max(0, newStock - adjustQty);
          } else {
            newStock = adjustQty;
          }
          return { ...item, stock: newStock };
        }
        return item;
      })
    );

    const typeText = adjustType === 'add' ? 'Tăng thêm' : adjustType === 'subtract' ? 'Giảm đi' : 'Điều chỉnh thành';
    toast.success(`Đã điều chỉnh tồn kho SKU ${adjustingItem.sku}: ${typeText} ${adjustQty} chiếc.`);
    setAdjustingItem(null);
  };

  const columns = [
    {
      header: 'Mã SKU',
      accessorKey: 'sku',
      cell: (item: StockItem) => (
        <span className="font-mono text-xs font-bold text-blue-600">
          {item.sku}
        </span>
      ),
    },
    {
      header: 'Sản phẩm & Biến thể',
      cell: (item: StockItem) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">{item.productName}</span>
          <span className="text-xs text-slate-400 font-medium">{item.variantName}</span>
        </div>
      ),
    },
    {
      header: 'Kho hàng',
      accessorKey: 'warehouseName',
      cell: (item: StockItem) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Warehouse size={13} className="text-slate-400" />
          {item.warehouseName}
        </div>
      ),
    },
    {
      header: 'Giá nhập/Giá bán',
      cell: (item: StockItem) => (
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Vốn: {formatCurrency(item.costPrice)}</span>
          <span className="text-xs text-slate-700 font-semibold">Bán: {formatCurrency(item.price)}</span>
        </div>
      ),
    },
    {
      header: 'Tồn kho thực tế',
      align: 'center' as const,
      cell: (item: StockItem) => {
        const isOutOfStock = item.stock === 0;
        const isLowStock = item.stock > 0 && item.stock <= item.lowStockThreshold;

        return (
          <Badge
            variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}
            className={cn(
              "text-[10px] py-0.5 px-2.5 font-bold border-none shadow-none whitespace-nowrap",
              isLowStock && "bg-amber-500 text-white",
              !isOutOfStock && !isLowStock && "bg-emerald-500 text-white"
            )}
          >
            {isOutOfStock ? 'Hết hàng (0)' : isLowStock ? `Sắp hết (${item.stock})` : `Đủ hàng (${item.stock})`}
          </Badge>
        );
      },
    },
    {
      header: 'Định mức tối thiểu',
      align: 'center' as const,
      cell: (item: StockItem) => (
        <span className="text-xs font-semibold text-slate-400">
          {item.lowStockThreshold} chiếc
        </span>
      ),
    },
    {
      header: 'Thao tác',
      align: 'right' as const,
      cell: (item: StockItem) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          onClick={() => handleAdjustClick(item)}
        >
          <RefreshCw size={11} /> Điều chỉnh nhanh
        </Button>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: 'Tồn kho', icon: Database },
  ];

  const warehouses = [
    { id: 'wh-1', name: 'Kho Chính Quận 1' },
    { id: 'wh-2', name: 'Kho Phụ Quận 7' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quản lý tồn kho"
        description="Quản lý số lượng hàng tồn thực tế tại các kho, điều chỉnh số lượng và cảnh báo sắp hết hàng."
      />

      {/* KPI Cards Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Tổng lượng tồn</span>
            <div className="text-2xl font-black text-slate-800">{stats.totalStock}</div>
            <span className="text-[10px] text-slate-400 font-medium">Chiếc trong kho</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Giá trị tồn kho (Vốn)</span>
            <div className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalValue)}</div>
            <span className="text-[10px] text-slate-400 font-medium">Tổng vốn lưu động</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Cảnh báo sắp hết</span>
            <div className="text-2xl font-black text-amber-500">{stats.lowStockCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Đạt định mức tối thiểu</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Số sản phẩm hết hàng</span>
            <div className="text-2xl font-black text-red-500">{stats.outOfStockCount}</div>
            <span className="text-[10px] text-slate-400 font-medium">Cần nhập kho gấp</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <DataCard
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo tên sản phẩm hoặc SKU..." 
          />
        }
        extra={
          <>
            <FilterPopover
              activeCount={(selectedWarehouse !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
              onClear={() => {
                setSelectedWarehouse('all');
                setSelectedStatus('all');
              }}
            >
              <div className="space-y-4 p-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Kho hàng</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả kho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả kho</SelectItem>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái tồn kho</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="ok">Đủ hàng</SelectItem>
                      <SelectItem value="low">Sắp hết hàng</SelectItem>
                      <SelectItem value="out">Hết hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FilterPopover>

            <SortPopover
              options={[
                { value: 'sku,asc', label: 'SKU (A-Z)' },
                { value: 'sku,desc', label: 'SKU (Z-A)' },
                { value: 'stock,asc', label: 'Tồn kho thấp nhất' },
                { value: 'stock,desc', label: 'Tồn kho cao nhất' },
              ]}
              currentValue={sortOption}
              onSelect={setSortOption}
            />
          </>
        }
      >
        <DataTable
          columns={columns as any}
          data={filteredItems}
          emptyState={{
            title: 'Không tìm thấy dòng tồn kho nào',
            description: 'Hãy kiểm tra lại điều kiện lọc hoặc nhập thêm hàng hóa.',
            icon: <Database className="h-10 w-10 text-slate-400" />,
            iconColor: 'bg-slate-50'
          }}
        />
      </DataCard>

      {/* Quick Adjust Dialog */}
      <Dialog open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Điều chỉnh tồn kho nhanh
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thực hiện thay đổi số lượng tồn kho trực tiếp cho SKU này.
            </DialogDescription>
          </DialogHeader>

          {adjustingItem && (
            <div className="space-y-5 py-3 text-slate-700">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                <div className="text-xs font-bold font-mono text-blue-600">{adjustingItem.sku}</div>
                <div className="text-sm font-semibold text-slate-800">{adjustingItem.productName}</div>
                <div className="text-xs text-slate-400 font-medium">{adjustingItem.variantName}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Kho hàng: <span className="font-bold">{adjustingItem.warehouseName}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                  Tồn kho hiện tại: 
                  <Badge className="bg-slate-200 text-slate-700 font-bold border-none px-2 py-0">
                    {adjustingItem.stock} chiếc
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Hình thức điều chỉnh</Label>
                <div className="flex gap-4">
                  {[
                    { id: 'add', label: 'Tăng (+)' },
                    { id: 'subtract', label: 'Giảm (-)' },
                    { id: 'set', label: 'Đặt lại (=)' },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="adjustType"
                        value={option.id}
                        checked={adjustType === option.id}
                        onChange={() => setAdjustType(option.id as any)}
                        className="h-4 w-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Số lượng thay đổi</Label>
                  <Input 
                    type="number" 
                    min={0}
                    value={adjustQty || ''}
                    onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Lý do điều chỉnh</Label>
                  <Select value={adjustReason} onValueChange={setAdjustReason}>
                    <SelectTrigger className="h-10 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Kiểm kho định kỳ</SelectItem>
                      <SelectItem value="restock">Nhập bổ sung</SelectItem>
                      <SelectItem value="damaged">Hàng lỗi / Hỏng hóc</SelectItem>
                      <SelectItem value="other">Lý do khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live Preview of Result */}
              <div className="text-xs bg-blue-50/50 text-blue-700 p-3 rounded-xl border border-blue-100/50 flex items-center gap-2">
                <Info size={14} className="text-blue-500 shrink-0" />
                <span>
                  Số lượng tồn sau điều chỉnh: 
                  <strong className="ml-1 font-bold">
                    {adjustType === 'add' ? adjustingItem.stock + adjustQty : 
                     adjustType === 'subtract' ? Math.max(0, adjustingItem.stock - adjustQty) : 
                     adjustQty} chiếc
                  </strong>
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setAdjustingItem(null)}>
              Hủy bỏ
            </Button>
            <Button size="sm" onClick={handleAdjustSubmit} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
