'use client';

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  ShieldCheck, 
  Search,
  Settings,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { 
  PageHeader, 
  DataTable, 
  type ColumnDef,
  Button,
  DataCard,
  NextPagination
} from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { AuditLog, AuditLogType } from '../types/audit-logs.interface';
import { getActionBadge } from '../utils/audit-log-formatters';
import { useAuditLogs } from '../hooks/use-audit-logs';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mockLogs: AuditLog[] = [
  {
    id: 'm-1',
    type: 'MANAGEMENT',
    action: 'UPDATE_PRODUCT',
    username: 'admin_thanh',
    details: 'Thay đổi giá sản phẩm Mực Sấy Bento Thái Lan 20g',
    target: 'Mực Sấy Bento Thái Lan 20g',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'm-2',
    type: 'MANAGEMENT',
    action: 'CREATE_ORDER',
    username: 'sales_manager',
    details: 'Tạo đơn hàng mới cho khách hàng Nguyễn Văn A',
    target: 'ORD-2026-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'm-3',
    type: 'MANAGEMENT',
    action: 'DELETE_BRAND',
    username: 'admin_thanh',
    details: 'Xóa thương hiệu Nokia khỏi hệ thống',
    target: 'Nokia',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function AuditLogsView() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<AuditLogType>('SYSTEM');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  // Fetch API /v1/audit-logs khi chon Tab 'SYSTEM'
  const { 
    data: apiResponse, 
    isFetching: isApiLoading,
    refetch 
  } = useAuditLogs({
    page,
    size,
    username: searchTerm || undefined,
    enabled: activeTab === 'SYSTEM',
  });

  const displayData = useMemo(() => {
    if (activeTab === 'SYSTEM') {
      return Array.isArray(apiResponse?.data) ? apiResponse.data : [];
    }
    return mockLogs.filter(log => 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, apiResponse, searchTerm]);

  const totalItems = useMemo(() => {
    if (activeTab === 'SYSTEM') {
      return apiResponse?.pagination?.totalElements || displayData.length;
    }
    return displayData.length;
  }, [activeTab, apiResponse, displayData]);

  const totalPages = useMemo(() => {
    if (activeTab === 'SYSTEM') {
      return apiResponse?.pagination?.totalPages || Math.ceil(totalItems / size) || 1;
    }
    return Math.ceil(displayData.length / size) || 1;
  }, [activeTab, apiResponse, totalItems, size, displayData]);

  const handleRefresh = () => {
    if (activeTab === 'SYSTEM') {
      refetch();
    }
    toast.success('Đã làm mới dữ liệu nhật ký');
  };

  const columns: ColumnDef<AuditLog>[] = useMemo(() => [
    {
      header: 'Thời gian',
      accessorKey: 'timestamp',
      cell: (log: AuditLog) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span className="text-xs font-medium">{formatDate(log.timestamp)}</span>
        </div>
      )
    },
    {
      header: 'Người thực hiện',
      accessorKey: 'username',
      cell: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
            {log.username ? log.username.substring(0, 2).toUpperCase() : <User size={12} />}
          </div>
          <span className="text-sm font-semibold text-slate-800">{log.username || 'System'}</span>
        </div>
      )
    },
    {
      header: 'Hành động',
      accessorKey: 'action',
      cell: (log: AuditLog) => getActionBadge(log.action)
    },
    {
      header: 'Chi tiết',
      accessorKey: 'details',
      cell: (log: AuditLog) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-700 line-clamp-1">{log.details || (log as any).description || 'Thực hiện thao tác hệ thống'}</p>
          {log.target && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 mt-1 inline-block font-mono">
              Target: {log.target}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'IP / Metadata',
      accessorKey: 'ipAddress',
      cell: (log: AuditLog) => (
        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          {log.ipAddress || (log as any).ip || '---'}
        </span>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hoạt động"
        breadcrumbs={[
          { label: 'Hệ thống', href: '/users' },
          { label: 'Nhật ký', active: true }
        ]}
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={cn("w-3.5 h-3.5", isApiLoading && "animate-spin")} />
            Làm mới
          </Button>
        }
      />

      <DataCard
        className="overflow-hidden"
        search={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo người dùng, nội dung..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        }
        extra={
          <div className="flex border border-slate-200 p-1 bg-white rounded-lg">
            <button
              onClick={() => {
                setActiveTab('SYSTEM');
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold transition-all rounded-md",
                activeTab === 'SYSTEM' 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShieldCheck size={14} />
              Hệ thống (API)
            </button>
            <button
              onClick={() => {
                setActiveTab('MANAGEMENT');
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold transition-all rounded-md",
                activeTab === 'MANAGEMENT' 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Activity size={14} />
              Quản lý
            </button>
          </div>
        }
        footer={
          isSuperAdmin && (isApiLoading || totalItems > 0) && (
            <NextPagination
              isLoading={isApiLoading}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={size}
              onItemsPerPageChange={setSize}
              onPageChange={setPage}
            />
          )
        }
      >
        <DataTable 
          columns={columns} 
          data={displayData} 
          isLoading={activeTab === 'SYSTEM' && isApiLoading && !displayData.length}
          isForbidden={!isSuperAdmin}
          forbiddenState={{
            title: "Không có quyền xem nhật ký hoạt động",
            description: "Chỉ Quản trị viên cấp cao (SUPER_ADMIN) mới có quyền truy cập nhật ký hoạt động của hệ thống.",
          }}
          emptyState={{
            title: "Chưa có nhật ký hoạt động",
            description: "Hiện chưa ghi nhận nhật ký hoạt động nào trong hệ thống.",
            icon: <ShieldCheck className="h-10 w-10 text-blue-500 opacity-80" />,
            iconColor: "bg-blue-50"
          }}
        />
      </DataCard>
    </div>
  );
}
