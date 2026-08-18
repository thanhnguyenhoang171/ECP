'use client';

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  PageHeader,
  Breadcrumbs,
} from "@/components/common";
import {
  SearchInput,
  ExportButton,
  ImportButton,
  AddNewButton,
  FilterPopover,
  SortPopover,
} from "@/components/common/view-control";
import { Layers } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Danh mục', icon: Layers }]} />

      {/* Real Static Page Header */}
      <PageHeader
        title="Quản lý danh mục"
        description="Quản lý các nhóm sản phẩm và phân loại hàng hóa."
        actions={
          <>
            <ImportButton disabled />
            <ExportButton disabled />
            <AddNewButton disabled />
          </>
        }
      />

      {/* Real Static Control Bar Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-4 rounded-2xl border border-slate-300/80 shadow-md">
        <div className="flex-1 max-w-md">
          <SearchInput value="" onChange={() => {}} placeholder="Tìm tên hoặc ID danh mục..." disabled />
        </div>
        <div className="flex items-center gap-2">
          <FilterPopover activeCount={0}>
            <div className="p-2 text-xs text-slate-500">Đang tải bộ lọc...</div>
          </FilterPopover>
          <SortPopover options={[]} currentValue="name,asc" onSelect={() => {}} disabled />
        </div>
      </div>

      {/* Main Content / Table Card */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100 shadow-md rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* Real Static Table Header */}
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500">Tên danh mục</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Cấp độ</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Nổi bật</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Ngày tạo</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center">Ngày sửa</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              {/* Data Row Skeletons Only */}
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-200/60 even:bg-slate-100/40">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-36 rounded-md" />
                          <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-5 w-14 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-5 w-18 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-4 w-20 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Skeleton className="h-4 w-20 mx-auto rounded-md" />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
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

      {/* Pagination Skeleton Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-slate-100 border border-slate-300/80 shadow-md rounded-2xl">
        <Skeleton className="h-4 w-40 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
