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
import {
  SearchInput,
  ExportButton,
  ImportButton,
  AddNewButton,
  FilterPopover,
  SortPopover,
} from '@/components/common/view-control';
import { Tag } from 'lucide-react';

export default function BrandsLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <Breadcrumbs items={[{ label: 'Thương hiệu', icon: Tag }]} />

      <PageHeader
        title="Quản lý Thương hiệu"
        description="Danh sách các thương hiệu sản phẩm trên hệ thống. Bạn có thể thêm mới, cập nhật hoặc thay đổi trạng thái."
        actions={
          <>
            <ImportButton onClick={() => {}} disabled />
            <ExportButton onExport={() => {}} isLoading={false} disabled />
            <AddNewButton onClick={() => {}} disabled />
          </>
        }
      />

      {/* Block 1: Search & Filter Card Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100/95 p-4 rounded-2xl border border-slate-300/80 shadow-md">
        <div className="flex-1 max-w-md">
          <SearchInput value="" onChange={() => {}} placeholder="Tìm theo tên thương hiệu, website..." />
        </div>
        <div className="flex items-center gap-2">
          <FilterPopover activeCount={0}>
            <div className="p-2 text-xs text-slate-500">Đang tải bộ lọc...</div>
          </FilterPopover>
          <SortPopover options={[]} currentValue="name,asc" onSelect={() => {}} disabled />
        </div>
      </div>

      {/* Block 2: Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[35%] min-w-[220px]">Thương hiệu</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[25%] min-w-[160px] hidden md:table-cell">Slug</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[15%] min-w-[110px]">Trạng thái</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[15%] min-w-[120px] hidden lg:table-cell">Ngày tạo</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[10%] min-w-[110px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    <TableCell className="pl-6 py-4 w-[35%] min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-28 rounded-md" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 w-[25%] min-w-[160px] hidden md:table-cell">
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center w-[15%] min-w-[110px]">
                      <Skeleton className="h-5 w-20 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 w-[15%] min-w-[120px] hidden lg:table-cell">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right w-[10%] min-w-[110px]">
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
