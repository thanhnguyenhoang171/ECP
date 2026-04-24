"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    price: 34990000,
    category: "Điện thoại",
    stock: 50,
    status: "active",
    sku: "IP15PM-256-BLUE",
  },
  {
    id: "2",
    name: "MacBook Air M3",
    price: 27990000,
    category: "Laptop",
    stock: 20,
    status: "active",
    sku: "MBA-M3-8-256",
  },
];

export default function ProductsPage() {
  const [products] = useState(MOCK_PRODUCTS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Sản phẩm</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium">
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Tổng sản phẩm</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{products.length}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Đang bán</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{products.length}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Hết hàng</div>
          <div className="mt-2 text-3xl font-bold text-red-600">0</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Ngừng kinh doanh</div>
          <div className="mt-2 text-3xl font-bold text-slate-400">0</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600">
              <Filter size={18} />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kho</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        IMG
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      Đang bán
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
