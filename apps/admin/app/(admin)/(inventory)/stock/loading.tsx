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
import { SearchInput, ExportButton } from '@/components/common/view-control';
import { Boxes } from 'lucide-react';

export default function StockLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <Breadcrumbs items={[{ label: 'Quản lý tồn kho', icon: Boxes }]} />

      <PageHeader
        title="Quản lý tồn kho"
        description="Quản lý số lượng hàng tồn thực tế tại các kho, điều chỉnh số lượng và cảnh báo sắp hết hàng."
        actions={<ExportButton onExport={() => {}} isLoading={false} disabled />}
      />

      {/* Block 1: Search & Filter Card Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/95 p-4 rounded-2xl border border-slate-300/80 shadow-md">
        <div className="flex-1 max-w-md">
          <SearchInput value="" onChange={() => {}} placeholder="Tìm theo tên sản phẩm hoặc SKU..." />
        </div>
      </div>

      {/* Block 2: Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[12%] min-w-[100px]">Mã SKU</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[24%] min-w-[180px]">Sản phẩm & Chi tiết Lô</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[16%] min-w-[130px]">Kho hàng</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[13%] min-w-[120px]">Tồn thực tế (OnHand)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[10%] min-w-[90px]">Đang khóa (Locked)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[12%] min-w-[110px]">Tồn khả dụng (Available)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[8%] min-w-[80px]">Cập nhật</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[5%] min-w-[90px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    <TableCell className="pl-6 py-4 w-[12%] min-w-[100px]">
                      <Skeleton className="h-4 w-20 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 w-[24%] min-w-[180px]">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-40 rounded-md" />
                        <Skeleton className="h-3 w-24 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 w-[16%] min-w-[130px]">
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[13%] min-w-[120px]">
                      <Skeleton className="h-6 w-24 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[10%] min-w-[90px]">
                      <Skeleton className="h-4 w-12 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[12%] min-w-[110px]">
                      <Skeleton className="h-4 w-12 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[8%] min-w-[80px]">
                      <Skeleton className="h-4 w-20 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right w-[5%] min-w-[90px]">
                      <Skeleton className="h-8 w-24 ml-auto rounded-lg" />
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
