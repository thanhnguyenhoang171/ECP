import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users as UsersIcon, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  RefreshCcw,
  ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Trang này hiện là Server Component (không có 'use client')
// Tốc độ phản hồi sẽ cực nhanh trên mobile
export default function DashboardPage() {
  const stats = [
    {
      title: "Tổng doanh thu",
      value: "128,450,000 đ",
      description: "+12% so với hôm qua",
      icon: <DollarSign className="h-4 w-4 text-blue-500" />,
      trend: "up",
      color: "border-l-4 border-l-blue-500"
    },
    {
      title: "Đơn hàng mới",
      value: "156",
      description: "+8% so with hôm qua",
      icon: <ShoppingCart className="h-4 w-4 text-orange-500" />,
      trend: "up",
      color: "border-l-4 border-l-orange-500"
    },
    {
      title: "Khách hàng mới",
      value: "42",
      description: "-3% so with tuần trước",
      icon: <UsersIcon className="h-4 w-4 text-green-500" />,
      trend: "down",
      color: "border-l-4 border-l-green-500"
    },
    {
      title: "Sản phẩm sắp hết",
      value: "12",
      description: "Cần nhập thêm hàng",
      icon: <Package className="h-4 w-4 text-purple-500" />,
      trend: "neutral",
      color: "border-l-4 border-l-purple-500"
    },
  ];

  const recentOrders = [
    { id: "#ORD-7281", customer: "Nguyễn Văn A", amount: "1,250,000 đ", status: "Completed", date: "14:30" },
    { id: "#ORD-7282", customer: "Trần Thị B", amount: "850,000 đ", status: "Pending", date: "15:45" },
    { id: "#ORD-7283", customer: "Lê Văn C", amount: "2,100,000 đ", status: "Processing", date: "16:20" },
    { id: "#ORD-7284", customer: "Phạm Thị D", amount: "450,000 đ", status: "Completed", date: "17:05" },
    { id: "#ORD-7285", customer: "Hoàng Văn E", amount: "1,780,000 đ", status: "Cancelled", date: "18:00" },
  ];

  const topProducts = [
    { name: "iPhone 15 Pro Max", sales: 145, revenue: "4.35B đ", initials: "IP" },
    { name: "MacBook Pro M3", sales: 82, revenue: "3.69B đ", initials: "MB" },
    { name: "AirPods Pro 2", sales: 312, revenue: "1.87B đ", initials: "AP" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bảng điều khiển</h1>
          <p className="text-muted-foreground text-sm">Chào mừng trở lại! Đây là tóm tắt hoạt động của cửa hàng hôm nay.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <RefreshCcw size={14} />
            Làm mới
          </Button>
          <Badge variant="secondary" className="h-9 px-4 text-sm font-medium">Hôm nay</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className={stat.color}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-1.5 bg-muted/50 rounded-md">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                {stat.trend === "up" && <ArrowUpRight size={10} className="text-green-500" />}
                {stat.trend === "down" && <ArrowDownRight size={10} className="text-red-500" />}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Biểu đồ doanh thu</CardTitle>
                <CardDescription className="text-xs">Tăng trưởng 24% so with tuần trước</CardDescription>
              </div>
              <TrendingUp className="text-primary h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full bg-slate-50/50 rounded-lg border border-dashed flex flex-col items-center justify-center text-muted-foreground">
              <TrendingUp size={40} className="mb-2 opacity-10" />
              <p className="text-xs font-medium">Đang tối ưu hóa biểu đồ...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-slate-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sản phẩm bán chạy</CardTitle>
            <CardDescription className="text-xs">Top 3 trong tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center">
                  <Avatar className="h-8 w-8 border border-slate-100">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                      {product.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 space-y-0.5">
                    <p className="text-xs font-bold leading-none">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.sales} lượt bán</p>
                  </div>
                  <div className="ml-auto font-bold text-xs text-green-600">
                    {product.revenue}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-[10px] uppercase tracking-widest font-bold text-primary gap-2 h-8">
              Tất cả sản phẩm <ChevronRight size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-100 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/30">
          <div>
            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
            <CardDescription className="text-xs">Cập nhật 2 phút trước</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">Xem tất cả</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase py-3">Mã đơn</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3">Khách hàng</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3">Số tiền</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase py-3">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-xs font-bold text-primary py-3 px-4">{order.id}</TableCell>
                    <TableCell className="text-xs py-3">{order.customer}</TableCell>
                    <TableCell className="text-xs font-medium py-3">{order.amount}</TableCell>
                    <TableCell className="py-3">
                      <Badge className="text-[9px] h-5 px-2" variant={
                        order.status === "Completed" ? "default" : 
                        order.status === "Pending" ? "outline" : "secondary"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
