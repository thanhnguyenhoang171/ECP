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
import { SearchInput, AddNewButton, ExportButton } from '@/components/common/view-control';
import { Users } from 'lucide-react';

export default function UsersLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <Breadcrumbs items={[{ label: 'Quản lý người dùng', icon: Users }]} />

      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản, phân quyền và trạng thái hoạt động của thành viên."
        actions={
          <>
            <ExportButton onExport={() => {}} isLoading={false} disabled />
            <AddNewButton onClick={() => {}} disabled />
          </>
        }
      />

      {/* Block 1: Search & Filter Card Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/95 p-4 rounded-2xl border border-slate-300/80 shadow-md">
        <div className="flex-1 max-w-md">
          <SearchInput value="" onChange={() => {}} placeholder="Tìm theo tên hoặc email..." />
        </div>
      </div>

      {/* Block 2: Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[26%] min-w-[200px]">Nhân sự</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[14%] min-w-[110px]">Số điện thoại</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[18%] min-w-[140px]">Vai trò (Gán quyền)</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[14%] min-w-[120px]">Trạng thái tài khoản</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[10%] min-w-[100px]">Trạng thái phiên</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[10%] min-w-[90px]">Ngày tạo</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[8%] min-w-[90px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    <TableCell className="pl-6 py-4 w-[26%] min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32 rounded-md" />
                          <Skeleton className="h-3 w-40 rounded-md font-mono" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 w-[14%] min-w-[110px]">
                      <Skeleton className="h-4 w-24 rounded-md font-mono" />
                    </TableCell>
                    <TableCell className="py-4 w-[18%] min-w-[140px]">
                      <Skeleton className="h-6 w-24 rounded-lg" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[14%] min-w-[120px]">
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[10%] min-w-[100px]">
                      <Skeleton className="h-4 w-24 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[10%] min-w-[90px]">
                      <Skeleton className="h-4 w-20 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right w-[8%] min-w-[90px]">
                      <div className="flex justify-end gap-1">
                        <Skeleton className="h-8 w-8 rounded-lg" />
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
