'use client';

import React from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ExternalLink,
  Globe,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  PageHeader, 
  DataTable, 
  Badge,
  DataCard,
  NextPagination,
  StatsCard
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Brand } from '../types/brand.interface';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useBrands, useBrandStats } from '../hooks/use-brands';
import { useViewParams } from '@/hooks/use-view-params';

export default function BrandsView() {
  const {
    page,
    size,
    sort,
    name: nameSearch,
    updateUrl,
    setPage,
    setSize
  } = useViewParams('createdAt,desc');

  const { data: brandsResponse, isLoading, isFetching } = useBrands({
    page,
    size,
    sort,
    keyword: nameSearch,
  });

  const { data: statsResponse } = useBrandStats();

  const brands = brandsResponse?.data || [];
  const stats = statsResponse?.data || { totalBrands: 0, activeBrands: 0, newBrandsThisMonth: 0 };
  const pagination = brandsResponse?.pagination;

  const columns = [
    {
      header: 'Thương hiệu',
      accessorKey: 'name',
      cell: (brand: Brand) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border bg-white flex items-center justify-center p-2">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <Award className="text-slate-400" size={20} />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-800">{brand.name}</div>
            <div className="text-xs text-slate-400">{brand.slug}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Website',
      accessorKey: 'website',
      cell: (brand: Brand) => (
        brand.website ? (
          <a 
            href={brand.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
          >
            <Globe size={14} />
            {new URL(brand.website).hostname}
            <ExternalLink size={12} />
          </a>
        ) : <span className="text-slate-300">-</span>
      )
    },
    {
      header: 'Trạng thái',
      accessorKey: 'isActive',
      cell: (brand: Brand) => (
        <Badge variant={brand.isActive ? 'success' : 'secondary'} className="gap-1">
          {brand.isActive ? (
            <><CheckCircle2 size={12} /> Hoạt động</>
          ) : (
            <><XCircle size={12} /> Tạm dừng</>
          )}
        </Badge>
      )
    },
    {
      header: 'Ngày tạo',
      accessorKey: 'createdAt',
      cell: (brand: Brand) => (
        <span className="text-sm text-slate-500">
          {format(new Date(brand.createdAt), 'dd/MM/yyyy', { locale: vi })}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={18} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Thương hiệu"
        breadcrumbs={[
          { label: 'Sản phẩm', href: '/products' },
          { label: 'Thương hiệu', active: true }
        ]}
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus size={18} className="mr-2" /> Thêm thương hiệu
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Tổng thương hiệu"
          value={stats.totalBrands}
          icon={<Award />}
          description="Các thương hiệu đang quản lý"
        />
        <StatsCard
          title="Thương hiệu hoạt động"
          value={stats.activeBrands}
          icon={<CheckCircle2 />}
          trend="up"
          description="Đang hiển thị trên website"
        />
        <StatsCard
          title="Thương hiệu mới"
          value={stats.newBrandsThisMonth}
          icon={<Plus />}
          description="Trong tháng này"
        />
      </div>

      <DataCard
        search={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm thương hiệu..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={nameSearch}
              onChange={(e) => updateUrl({ name: e.target.value, page: 1 })}
            />
          </div>
        }
        footer={
          pagination && (
            <div className="p-4">
              <NextPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )
        }
      >
        <DataTable 
          columns={columns} 
          data={brands} 
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </DataCard>
    </div>
  );
}
