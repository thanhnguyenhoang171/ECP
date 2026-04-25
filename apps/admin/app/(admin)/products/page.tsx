import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Download 
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductPage() {
  const products = [
    { id: "PROD-001", name: "iPhone 15 Pro Max", category: "Điện thoại", price: "34,990,000 đ", stock: 45, status: "In Stock" },
    { id: "PROD-002", name: "MacBook Pro M3", category: "Laptop", price: "45,990,000 đ", stock: 12, status: "Low Stock" },
    { id: "PROD-003", name: "AirPods Pro 2", category: "Phụ kiện", price: "5,990,000 đ", stock: 0, status: "Out of Stock" },
    { id: "PROD-004", name: "iPad Pro M2", category: "Máy tính bảng", price: "22,990,000 đ", stock: 28, status: "In Stock" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-slate-500 text-sm">Xem và quản lý danh mục sản phẩm của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-slate-200">
            <Download className="mr-2 h-4 w-4 text-slate-500" /> Xuất file
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 shadow-md shadow-blue-100">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden">
        <CardHeader className="pb-4 bg-slate-50/30 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Tìm tên sản phẩm..." className="pl-9 h-10 text-sm bg-white border-slate-200 focus-visible:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10 text-xs border-slate-200">
                <Filter className="mr-2 h-4 w-4 text-slate-400" /> Lọc
              </Button>
              <Button variant="outline" className="h-10 text-xs border-slate-200">
                <ArrowUpDown className="mr-2 h-4 w-4 text-slate-400" /> Sắp xếp
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[11px] font-bold uppercase py-4 px-4 w-[100px] text-slate-500">Mã</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase py-4 text-slate-500">Tên sản phẩm</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase py-4 text-slate-500 hidden md:table-cell">Danh mục</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase py-4 text-right text-slate-500">Giá</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase py-4 text-center text-slate-500">Kho</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase py-4 text-right pr-6 text-slate-500">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-50">
                    <TableCell className="font-mono text-[11px] font-bold py-4 px-4 text-slate-400">{product.id}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{product.name}</span>
                        <span className="text-[11px] text-slate-400 md:hidden">{product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 py-4 hidden md:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-blue-600 py-4">{product.price}</TableCell>
                    <TableCell className="text-center py-4">
                      <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-slate-100 text-slate-600 border-none">{product.stock}</Badge>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/20">
            <span className="text-[11px] text-slate-400">Hiển thị 4 trên 120 sản phẩm</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-3 border-slate-200" disabled>Trước</Button>
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-3 border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all">Tiếp</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
