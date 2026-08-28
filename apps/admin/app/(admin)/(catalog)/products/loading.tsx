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
import { Package } from 'lucide-react';

export default function ProductsLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Breadcrumbs Skeleton */}
      <Breadcrumbs items={[{ label: 'Sản phẩm', icon: Package }]} />

      {/* Page Header Static Controls */}
      <PageHeader
        title="Quản lý sản phẩm"
        description="Xem và quản lý danh mục sản phẩm của bạn."
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
          <SearchInput
            value=""
            onChange={() => {}}
            placeholder="Tìm tên sản phẩm hoặc mã SKU..."
          />
        </div>

        <div className="flex items-center gap-2">
          <FilterPopover activeCount={0}>
            <div className="p-2 text-xs text-slate-500">Đang tải bộ lọc...</div>
          </FilterPopover>

          <SortPopover
            options={[]}
            currentValue="name,asc"
            onSelect={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Block 2: Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-300/80 bg-slate-100/95 shadow-md rounded-2xl transition-all">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 text-[11px] font-bold uppercase text-slate-500 w-[35%] min-w-[240px]">Sản phẩm</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 w-[18%] min-w-[140px] hidden md:table-cell">Danh mục</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[12%] min-w-[100px]">Biến thể SKU</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[15%] min-w-[120px]">Giá bán</TableHead>
                  <TableHead className="py-4 text-[11px] font-bold uppercase text-slate-500 text-center w-[10%] min-w-[90px]">Trạng thái</TableHead>
                  <TableHead className="pr-6 py-4 text-[11px] font-bold uppercase text-slate-500 text-right w-[10%] min-w-[110px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100/60 even:bg-slate-50/30">
                    {/* Product Cell (Thumbnail 48x48 + Title & SKU Badge) */}
                    <TableCell className="pl-6 py-4 w-[35%] min-w-[240px]">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                          <Skeleton className="h-4 w-44 rounded-md" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-20 rounded-md" />
                            <Skeleton className="h-3 w-16 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category Cell */}
                    <TableCell className="py-4 w-[18%] min-w-[140px] hidden md:table-cell">
                      <Skeleton className="h-4 w-28 rounded-md" />
                    </TableCell>

                    {/* Variant Pill Cell */}
                    <TableCell className="py-4 text-center w-[12%] min-w-[100px]">
                      <Skeleton className="h-6 w-16 mx-auto rounded-lg" />
                    </TableCell>

                    {/* Price Cell */}
                    <TableCell className="py-4 text-right w-[15%] min-w-[120px]">
                      <Skeleton className="h-5 w-24 ml-auto rounded-md" />
                    </TableCell>

                    {/* Status Badge Cell */}
                    <TableCell className="py-4 text-center w-[10%] min-w-[90px]">
                      <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                    </TableCell>

                    {/* Action Buttons Cell (View, Edit, Delete) */}
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
