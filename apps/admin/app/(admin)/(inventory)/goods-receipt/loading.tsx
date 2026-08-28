'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumbs,
  PageHeader,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common';
import { SearchInput, AddNewButton } from '@/components/common/view-control';
import { PackagePlus } from 'lucide-react';

export default function GoodsReceiptLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <Breadcrumbs items={[{ label: 'Nhập kho', icon: PackagePlus }]} />

      <PageHeader
        title="Quản lý phiếu nhập kho"
        description="Quản lý các đợt nhập kho sản phẩm từ nhà cung cấp và chuyển kho nội bộ."
        actions={<AddNewButton onClick={() => {}} disabled />}
      />

      {/* Block 1: Search & Filter Card Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/95 p-4 rounded-2xl border border-slate-300/80 shadow-md">
        <div className="flex-1 max-w-md">
          <SearchInput value="" onChange={() => {}} placeholder="Tìm theo mã phiếu nhập, nhà cung cấp..." />
        </div>
      </div>

      {/* Block 2: Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[15%] min-w-[120px]">Mã nhập kho</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[20%] min-w-[150px]">Kho thực nhận</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[15%] min-w-[120px]">Đơn mua (PO)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[12%] min-w-[100px]">Số SKU nhập</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[18%] min-w-[140px]">Trạng thái (Đổi nhanh)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[12%] min-w-[110px]">Ngày nhập</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[8%] min-w-[90px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    <TableCell className="pl-6 py-4 w-[15%] min-w-[120px]">
                      <Skeleton className="h-4 w-28 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 w-[20%] min-w-[150px]">
                      <Skeleton className="h-4 w-32 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 w-[15%] min-w-[120px]">
                      <Skeleton className="h-4 w-24 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[12%] min-w-[100px]">
                      <Skeleton className="h-4 w-20 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[18%] min-w-[140px]">
                      <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 w-[12%] min-w-[110px]">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="h-3 w-16 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right w-[8%] min-w-[90px]">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Pagination Card Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-slate-100 border border-slate-300/80 shadow-md rounded-2xl transition-all">
        <Skeleton className="h-4 w-44 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <div className="flex gap-1.5">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
