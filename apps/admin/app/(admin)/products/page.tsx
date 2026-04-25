import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  Download,
  Package
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Server Component cho hiệu năng tối đa
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground text-sm">Xem và quản lý danh mục sản phẩm của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-3.5 w-3.5" /> Xuất file
          </Button>
          <Button size="sm" className="bg-primary h-9">
            <Plus className="mr-2 h-3.5 w-3.5" /> Thêm mới
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Tìm tên sản phẩm..." className="pl-9 h-9 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-9 text-xs">
                <Filter className="mr-2 h-3.5 w-3.5" /> Lọc
              </Button>
              <Button variant="outline" className="h-9 text-xs">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5" /> Sắp xếp
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase py-3 px-4 w-[100px]">Mã</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3">Tên sản phẩm</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3 hidden md:table-cell">Danh mục</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3 text-right">Giá</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3 text-center">Kho</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3 text-right pr-4">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="font-mono text-[10px] font-bold py-3 px-4 text-slate-400">{product.id}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{product.name}</span>
                        <span className="text-[10px] text-slate-400 md:hidden">{product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 py-3 hidden md:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-primary py-3">{product.price}</TableCell>
                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className="text-[9px] h-5 px-1.5">{product.stock}</Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/20">
            <span className="text-[10px] text-slate-400">Hiển thị 4 trên 120 sản phẩm</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 text-[10px]" disabled>Trước</Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px]">Tiếp</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
