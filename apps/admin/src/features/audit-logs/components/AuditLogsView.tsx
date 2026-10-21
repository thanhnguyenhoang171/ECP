'use client';

import React, { useMemo, useState } from 'react';
import { Activity, Eye, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, DataTable, type ColumnDef, DataCard, NextPagination } from '@/components/common';
import { DeleteConfirmDialog } from '@/components/common/view-control';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage, isForbiddenError } from '@/constants/errorMessages';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { AuditLog, AuditLogType } from '../types/audit-logs.interface';
import { getActionBadge } from '../utils/audit-log-formatters';
import { useAuditLogs, useDeleteAuditLog } from '../hooks/use-audit-logs';
import { auditLogsApi } from '../api/audit-logs.api';

export default function AuditLogsView(): React.JSX.Element {
  const user = useAuthStore(state => state.user);
  const roles = [...(user?.roles || []), user?.role || ''].map(role => role.replace(/^ROLE_/i, '').toUpperCase());
  const isSuperAdmin = roles.includes('SUPER_ADMIN');
  const canRead = isSuperAdmin || roles.includes('MANAGER');
  const [selectedTab, setSelectedTab] = useState<AuditLogType>('SYSTEM');
  const activeTab = isSuperAdmin ? selectedTab : 'MANAGEMENT';
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [detail, setDetail] = useState<AuditLog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dateError = Boolean(from && to && from > to);
  const logs = useAuditLogs({ page, size, sort: 'timestamp,desc', keyword: searchTerm || undefined,
    module: activeTab, status: status || undefined, from: from ? `${from}T00:00:00` : undefined,
    to: to ? `${to}T23:59:59.999999999` : undefined, enabled: canRead && !dateError });
  const deletion = useDeleteAuditLog();
  const data = useMemo(() => logs.data?.data || [], [logs.data]);
  const total = logs.data?.pagination?.totalElements ?? 0;

  const viewDetail = async (id: string): Promise<void> => {
    setLoadingDetail(true);
    try { setDetail(await auditLogsApi.getById(id)); }
    catch (error) { toast.error(getApiErrorMessage(error, 'Không thể tải chi tiết nhật ký.')); }
    finally { setLoadingDetail(false); }
  };
  const columns: ColumnDef<AuditLog>[] = [
    { header: 'Thời gian', cell: entry => <span className="text-xs whitespace-nowrap">{formatDate(entry.timestamp)}</span> },
    { header: 'Người thực hiện', cell: entry => <span className="text-sm font-medium">{entry.email || entry.username || 'SYSTEM'}</span> },
    { header: 'Hành động', cell: entry => getActionBadge(entry.action) },
    { header: 'Kết quả', cell: entry => <span className={cn('text-xs font-semibold', entry.status === 'FAILURE' ? 'text-red-500' : 'text-emerald-600')}>{entry.status === 'FAILURE' ? 'Thất bại' : entry.status === 'SUCCESS' ? 'Thành công' : entry.status || '—'}</span> },
    { header: 'Chi tiết', cell: entry => <p className="max-w-md truncate text-sm" title={entry.details}>{entry.details || '—'}</p> },
    { header: 'Địa chỉ IP', cell: entry => <span className="text-xs font-mono">{entry.ipAddress || '—'}</span> },
    { header: 'Thao tác', align: 'right', cell: entry => <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label="Xem chi tiết nhật ký" disabled={loadingDetail} onClick={() => { void viewDetail(entry.id); }}><Eye size={16} /></Button>
      {isSuperAdmin && <Button variant="ghost" size="icon" aria-label="Xoá nhật ký" className="text-red-500" onClick={() => setDeleteId(entry.id)}><Trash2 size={16} /></Button>}
    </div> },
  ];

  return <div className="space-y-6">
    <PageHeader title="Nhật ký kiểm toán" description={isSuperAdmin ? 'Theo dõi nhật ký API và hoạt động quản lý của toàn hệ thống.' : 'Nhật ký thao tác quản lý do chính tài khoản của bạn thực hiện.'} action={
      <Button variant="outline" size="sm" disabled={logs.isFetching || !canRead || dateError} onClick={() => { void logs.refetch(); }}><RefreshCw size={14} className={cn('mr-2', logs.isFetching && 'animate-spin')} />Làm mới</Button>
    } />
    <DataCard search={<input aria-label="Tìm kiếm nhật ký" placeholder="Tìm hành động, email, nội dung hoặc IP..." className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={searchTerm} onChange={event => { setSearchTerm(event.target.value); setPage(1); }} />}
      extra={<div className="flex gap-1 rounded-lg border p-1" role="tablist" aria-label="Loại nhật ký">
        {isSuperAdmin && <button role="tab" aria-selected={activeTab === 'SYSTEM'} className={cn('flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold', activeTab === 'SYSTEM' && 'bg-primary text-primary-foreground')} onClick={() => { setSelectedTab('SYSTEM'); setPage(1); }}><ShieldCheck size={14} />Hệ thống (API)</button>}
        <button role="tab" aria-selected={activeTab === 'MANAGEMENT'} className={cn('flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold', activeTab === 'MANAGEMENT' && 'bg-primary text-primary-foreground')} onClick={() => { setSelectedTab('MANAGEMENT'); setPage(1); }}><Activity size={14} />Quản lý</button>
      </div>}
      footer={canRead && !logs.isError && <NextPagination isLoading={logs.isFetching} currentPage={page} totalPages={Math.max(1, logs.data?.pagination?.totalPages || 1)} totalItems={total} itemsPerPage={size} onItemsPerPageChange={value => { setSize(value); setPage(1); }} onPageChange={setPage} />}>
      <div className="flex flex-wrap items-end gap-3 border-b p-4 text-xs">
        <label className="space-y-1">Kết quả<select aria-label="Lọc kết quả" className="ml-2 rounded border bg-background p-2" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả</option><option value="SUCCESS">Thành công</option><option value="FAILURE">Thất bại</option></select></label>
        <label>Từ ngày<input type="date" className="ml-2 rounded border bg-background p-2" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} /></label>
        <label>Đến ngày<input type="date" className="ml-2 rounded border bg-background p-2" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} /></label>
        <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setStatus(''); setFrom(''); setTo(''); setPage(1); }}>Xoá bộ lọc</Button>
      </div>
      {dateError ? <p role="alert" className="p-4 text-sm text-red-500">Ngày bắt đầu phải trước ngày kết thúc.</p> : logs.isError && !isForbiddenError(logs.error) ? <div role="alert" className="p-6 text-sm text-red-500">{getApiErrorMessage(logs.error, 'Không thể tải nhật ký.')} <Button variant="outline" size="sm" onClick={() => { void logs.refetch(); }}>Thử lại</Button></div> :
        <DataTable columns={columns} data={data} isLoading={logs.isFetching && !data.length} isForbidden={!canRead || isForbiddenError(logs.error)} forbiddenState={{ title: 'Không có quyền xem nhật ký', description: 'Chỉ Super Admin và Manager được truy cập nhật ký trong phạm vi được cấp.' }} emptyState={{ title: 'Chưa có nhật ký phù hợp', description: 'Thử thay đổi từ khoá hoặc bộ lọc.' }} />}
    </DataCard>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) { setDetail(null); } }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Chi tiết nhật ký kiểm toán</DialogTitle></DialogHeader>{detail && <dl className="space-y-3 text-sm">
      {Object.entries({ 'Thời gian': formatDate(detail.timestamp), 'Người thực hiện': detail.email || detail.username || 'SYSTEM', 'Hành động': detail.action, 'Loại': detail.module, 'Phân hệ': detail.domain, 'Kết quả': detail.status, 'Địa chỉ IP': detail.ipAddress, 'Thiết bị': detail.userAgent, 'Nội dung': detail.details }).map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="whitespace-pre-wrap break-words">{value || '—'}</dd></div>)}
    </dl>}</DialogContent></Dialog>
    {isSuperAdmin && <DeleteConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deletion.mutate(deleteId, { onSuccess: () => { setDeleteId(null); setPage(1); } }); } }} isLoading={deletion.isPending} title="Xoá nhật ký kiểm toán" description="Nhật ký này sẽ bị xoá vĩnh viễn. Hành động xoá được ghi lại trong nhật ký hệ thống." />}
  </div>;
}
