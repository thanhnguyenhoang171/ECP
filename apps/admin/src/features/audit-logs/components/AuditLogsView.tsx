'use client';

import React, { useState } from 'react';
import { Activity, Clock, User, FileText, RotateCcw, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  PageHeader, 
  DataCard, 
  DataTable, 
  type ColumnDef, 
  Badge,
  NextPagination,
  Button,
  Forbidden
} from '@/components/common';
import { 
  SearchInput, 
  FilterPopover, 
  ExportButton
} from '@/components/common/view-control';
import { useViewParams, useDebounceSearch } from '@/hooks/use-view-params';
import { AuditLog } from '../types/audit-logs.interface';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuditLogs } from '../hooks/use-audit-logs';
import { getActionBadge } from '../utils/audit-log-formatters';
import { useAuthStore } from '@/store/authStore';

const ACTIONS = [
  { label: 'Tạo mới', value: 'CREATE' },
  { label: 'Cập nhật', value: 'UPDATE' },
  { label: 'Xóa', value: 'DELETE' },
  { label: 'Nhập dữ liệu', value: 'IMPORT' },
  { label: 'Xuất dữ liệu', value: 'EXPORT' },
  { label: 'Đăng nhập', value: 'LOGIN' },
  { label: 'Đăng ký', value: 'REGISTER' },
  { label: 'Đăng xuất', value: 'LOGOUT' },
  // Giả sử có thêm nhiều action khác...
];

const INITIAL_VISIBLE_ACTIONS = 5; // Số lượng action hiển thị mặc định

export default function AuditLogsView() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN');

  const {
    page,
    size,
    sort,
    searchParams,
    updateUrl,
    setPage,
    setSize
  } = useViewParams('timestamp,desc');

  const usernameParam = searchParams.get('username') || '';
  const actionParam = searchParams.get('action') || '';

  const { data: response, isLoading, isError, refetch } = useAuditLogs({
    page,
    size,
    sort,
    username: usernameParam,
    action: actionParam
  });

  const [searchTerm, setSearchTerm] = useDebounceSearch(usernameParam, (val) => updateUrl({ username: val, page: 1 }));
  const [isExporting, setIsExporting] = useState(false);
  
  // State quản lý việc mở rộng danh sách Filter
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);

  if (!isSuperAdmin) {
    return <Forbidden />;
  }

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success('Xuất nhật ký hệ thống thành công');
      setIsExporting(false);
    }, 1500);
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      header: 'Thời gian',
      cell: (log) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-600 whitespace-nowrap">
            {formatDate(log.timestamp)}
          </span>
        </div>
      ),
      headerClassName: 'w-44',
    },
    {
      header: 'Người thực hiện',
      cell: (log) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {['admin', 'super_admin', 'root'].some(u => log.username.toLowerCase().includes(u)) ? (
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-slate-500" />
            )}
          </div>
          <span className="text-sm font-semibold text-slate-900">{log.username}</span>
        </div>
      ),
      headerClassName: 'w-52',
    },
    {
      header: 'Hành động',
      cell: (log) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {getActionBadge(log.action)}
            <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
              {log.action}
            </code>
          </div>
        </div>
      ),
      headerClassName: 'w-60',
    },
    {
      header: 'Nội dung chi tiết',
      cell: (log) => (
        <div className="flex items-start gap-2.5 py-1">
          <FileText className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-600 leading-relaxed line-clamp-2" title={log.details}>
            {log.details}
          </span>
        </div>
      ),
    },
  ];

  const filterBtnClass = (active: boolean) => cn(
    "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left group",
    active 
      ? "bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-200" 
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  );

  // Tính toán danh sách action hiển thị dựa trên trạng thái
  const visibleActions = isActionsExpanded 
    ? ACTIONS 
    : ACTIONS.slice(0, INITIAL_VISIBLE_ACTIONS);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Nhật ký hệ thống" 
        description="Theo dõi toàn bộ lịch sử thao tác, thay đổi dữ liệu và truy cập trong hệ thống."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => {
                updateUrl({ username: '', action: '', page: 1 });
                refetch();
              }}
              disabled={isLoading}
            >
              <RotateCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Làm mới
            </Button>
            <ExportButton onExport={handleExport} isLoading={isExporting} disabled={isLoading} />
          </div>
        }
      />

      <DataCard
        search={
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo người dùng, nội dung hoặc mã hành động..." 
            isLoading={isLoading}
          />
        }
        extra={
          <FilterPopover
            activeCount={actionParam ? 1 : 0}
            onClear={() => {
              updateUrl({ action: '', page: 1 });
              setIsActionsExpanded(false); // Reset lại trạng thái xem thêm khi clear filter
            }}
          >
            <div className="space-y-2">
              <h4 className="font-semibold text-[11px] text-slate-400 uppercase tracking-widest pl-1">Nhóm hành động</h4>
              
              {/* Danh sách Action Buttons */}
              <div className="flex flex-col gap-1.5">
                {visibleActions.map((act) => (
                  <button
                    key={act.value}
                    className={filterBtnClass(actionParam === act.value)}
                    onClick={() => updateUrl({ action: act.value, page: 1 })}
                  >
                    <span>{act.label}</span>
                    {actionParam === act.value && <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </button>
                ))}
              </div>
              
              {/* Nút Xem thêm / Thu gọn */}
              {ACTIONS.length > INITIAL_VISIBLE_ACTIONS && (
                <button
                  onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                  className="flex items-center gap-1.5 px-3 py-1.5 mt-1 text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors w-full"
                >
                  {isActionsExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Xem thêm ({ACTIONS.length - INITIAL_VISIBLE_ACTIONS})
                    </>
                  )}
                </button>
              )}
              
              <div className="pt-2 border-t border-slate-100">
              </div>
            </div>
          </FilterPopover>
        }
        footer={
          response?.pagination && response.pagination.totalElements > 0 && (
            <NextPagination
              currentPage={page}
              totalPages={response.pagination.totalPages}
              totalItems={response.pagination.totalElements}
              itemsPerPage={size}
              onPageChange={setPage}
              onItemsPerPageChange={setSize}
              className="bg-slate-50/40 border-t border-slate-100/50"
            />
          )
        }
      >
        <DataTable
          columns={columns}
          data={response?.data || []}
          isLoading={isLoading}
          loadingRows={size}
          emptyState={isError ? {
            title: 'Lỗi tải dữ liệu',
            description: 'Đã có lỗi xảy ra khi truy xuất nhật ký hệ thống.',
            icon: <Activity className="h-12 w-12 text-red-300" />,
            iconColor: 'bg-red-50',
          } : {
            title: 'Không tìm thấy nhật ký',
            description: 'Chúng tôi không tìm thấy kết quả nào phù hợp với điều kiện tìm kiếm của bạn.',
            icon: <Activity className="h-12 w-12 text-slate-300" />,
            iconColor: 'bg-slate-50',
          }}
        />
      </DataCard>
    </div>
  );
}