'use client';

import React from 'react';
import { Package, ChevronRight } from 'lucide-react';
import { formatVND } from '@/utils/formatters';

const mockOrders = [
  {
    id: 'ORD-2026-8891',
    date: '20/07/2026',
    status: 'Đang giao hàng',
    statusColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    total: 3240000,
    itemsCount: 2,
    productName: 'Tai Nghe Không Dây Pro Max ANC',
  },
  {
    id: 'ORD-2026-7712',
    date: '05/06/2026',
    status: 'Hoàn thành',
    statusColor: 'bg-zinc-900 text-white border-zinc-900',
    total: 1450000,
    itemsCount: 1,
    productName: 'Áo Polo Cotton Compact',
  },
];

export default function ProfileOrdersTab() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-6 space-y-4">
      <h3 className="text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
        Lịch sử đơn hàng
      </h3>

      <div className="space-y-3">
        {mockOrders.map((order) => (
          <div key={order.id} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-600" />
                <span className="font-semibold text-zinc-900 text-xs">{order.id}</span>
                <span className="text-[11px] text-zinc-400">• {order.date}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${order.statusColor} self-start sm:self-auto`}>
                {order.status}
              </span>
            </div>

            <div className="text-xs text-zinc-600">
              <p className="font-medium text-zinc-800">{order.productName}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{order.itemsCount} sản phẩm</p>
            </div>

            <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-900">
                Tổng tiền: <span className="font-bold">{formatVND(order.total)}</span>
              </span>
              <button className="flex items-center gap-1 text-zinc-900 font-medium hover:underline text-xs cursor-pointer">
                Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
