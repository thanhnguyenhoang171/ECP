'use client';

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  ShieldCheck, 
  Search,
  Settings,
  ShoppingBag
} from 'lucide-react';
import { 
  PageHeader, 
  DataTable, 
  Button,
  Forbidden,
  DataCard,
  StatsCard
} from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { AuditLog, AuditLogType } from '../types/audit-logs.interface';
import { getActionBadge } from '../utils/audit-log-formatters';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mockLogs: AuditLog[] = [
  // MANAGEMENT LOGS
  {
    id: 'm-1',
    type: 'MANAGEMENT',
    action: 'UPDATE_PRODUCT',
    username: 'admin_thanh',
    details: 'Thay đổi giá sản phẩm iPhone 15 Pro Max',
    target: 'iPhone 15 Pro Max',
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
  // SYSTEM LOGS
  {
    id: 's-1',
    type: 'SYSTEM',
    action: 'LOGIN',
    username: 'admin_thanh',
    details: 'Đăng nhập thành công từ địa chỉ IP 1.2.3.4',
    ipAddress: '1.2.3.4',
    timestamp: new Date().toISOString(),
  },
  {
    id: 's-2',
    type: 'SYSTEM',
    action: 'UPDATE_SETTINGS',
    username: 'system_root',
    details: 'Thay đổi cấu hình SMTP Mail Server',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 's-3',
    type: 'SYSTEM',
    action: 'EXPORT_DATABASE',
    username: 'super_admin',
    details: 'Sao lưu dữ liệu hệ thống định kỳ',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function AuditLogsView() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<AuditLogType>('MANAGEMENT');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => 
      log.type === activeTab && 
      (log.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
       log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, searchTerm]);

  if (!isSuperAdmin) {
    return <Forbidden />;
  }

  const columns = [
    {
      header: 'Thời gian',
      accessorKey: 'timestamp',
      cell: (log: AuditLog) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span className="text-xs">{formatDate(log.timestamp)}</span>
        </div>
      )
    },
    {
      header: 'Người thực hiện',
      accessorKey: 'username',
      cell: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={12} className="text-slate-500" />
          </div>
          <span className="text-sm font-medium text-slate-700">{log.username}</span>
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
          <p className="text-sm text-slate-600 line-clamp-1">{log.details}</p>
          {log.target && (
            <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 mt-1 inline-block">
              Đối tượng: {log.target}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'IP / Metadata',
      accessorKey: 'ipAddress',
      cell: (log: AuditLog) => (
        <span className="text-xs font-mono text-slate-400">
          {log.ipAddress || '---'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký hoạt động"
        breadcrumbs={[
          { label: 'Hệ thống', href: '/users' },
          { label: 'Nhật ký', active: true }
        ]}
        action={
          <Button variant="outline" size="sm" onClick={() => toast.success('Đã làm mới dữ liệu')}>
            Làm mới
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Nhật ký Quản lý"
          value={mockLogs.filter(l => l.type === 'MANAGEMENT').length}
          icon={<ShoppingBag />}
          color="bg-indigo-50 text-indigo-600 border-indigo-100"
          description="Sản phẩm, Đơn hàng, Thương hiệu..."
        />
        <StatsCard
          title="Nhật ký Hệ thống"
          value={mockLogs.filter(l => l.type === 'SYSTEM').length}
          icon={<Settings />}
          color="bg-slate-50 text-slate-600 border-slate-100"
          description="Cài đặt, Đăng nhập, Sao lưu..."
        />
      </div>

      <DataCard
        className="overflow-hidden"
        search={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo người dùng, nội dung..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
        extra={
          <div className="flex border border-slate-200 p-1 bg-white rounded-lg">
            <button
              onClick={() => setActiveTab('MANAGEMENT')}
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
            <button
              onClick={() => setActiveTab('SYSTEM')}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold transition-all rounded-md",
                activeTab === 'SYSTEM' 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShieldCheck size={14} />
              Hệ thống
            </button>
          </div>
        }
      >
        <DataTable 
          columns={columns} 
          data={filteredLogs} 
        />
      </DataCard>
    </div>
  );
}
