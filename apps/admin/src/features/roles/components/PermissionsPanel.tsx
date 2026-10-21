'use client';

import React, { useMemo, useState } from 'react';
import { DataTable, type ColumnDef } from '@/components/common';
import { DeleteConfirmDialog } from '@/components/common/view-control';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getApiErrorMessage, isForbiddenError } from '@/constants/errorMessages';
import { Permission } from '../types/role.interface';
import { useDeletePermission, usePermissions, useRoleAccess } from '../hooks/use-roles';
import PermissionForm from './PermissionForm';

export default function PermissionsPanel(): React.JSX.Element {
  const query = usePermissions();
  const { data: access } = useRoleAccess();
  const deletion = useDeletePermission();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Permission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const permissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data || []).filter(item => [item.name, item.code, item.module].some(value => value.toLowerCase().includes(term)));
  }, [query.data, search]);
  const columns: ColumnDef<Permission>[] = [
    { header: 'Quyền', cell: item => <div><p className="font-medium">{item.name}</p><code className="text-xs text-muted-foreground">{item.code}</code></div> },
    { header: 'Nhóm', cell: item => item.module },
    { header: 'Mô tả', cell: item => item.description || '—' },
    { header: 'Loại', cell: item => item.system ? 'Hệ thống' : 'Tuỳ chỉnh' },
    { header: 'Thao tác', align: 'right', cell: item => <div className="flex justify-end gap-1">
      {access?.update && <Button variant="ghost" size="sm" disabled={item.editable === false} onClick={() => setEditing(item)}>Sửa</Button>}
      {access?.delete && !item.system && <Button variant="ghost" size="sm" className="text-red-500" disabled={item.deletable === false} onClick={() => setDeleteId(item.id)}>Xoá</Button>}
    </div> },
  ];
  return <section className="space-y-4 rounded-2xl border bg-card p-5">
    <div><h2 className="font-semibold">Danh mục quyền hạn</h2><p className="text-xs text-muted-foreground">Quyền phải được API hỗ trợ mới có hiệu lực. Mã quyền được giữ cố định sau khi tạo.</p></div>
    <input aria-label="Tìm kiếm quyền" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Tìm theo tên, mã quyền hoặc nhóm..." value={search} onChange={event => setSearch(event.target.value)} />
    {query.isError && !isForbiddenError(query.error) ? <p role="alert" className="text-sm text-red-500">{getApiErrorMessage(query.error, 'Không thể tải danh sách quyền.')} <Button variant="outline" size="sm" onClick={() => { void query.refetch(); }}>Thử lại</Button></p> : <DataTable auditTrail columns={columns} data={permissions} isLoading={query.isLoading} isForbidden={isForbiddenError(query.error)} emptyState={{ title: 'Chưa có quyền phù hợp', description: 'Thay đổi từ khoá hoặc thêm quyền mới trong phạm vi của bạn.' }} />}
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) { setEditing(null); } }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Chỉnh sửa quyền hạn</DialogTitle></DialogHeader>{editing && <PermissionForm key={editing.id} initialData={editing} isDialog onSuccess={() => setEditing(null)} onCancel={() => setEditing(null)} />}</DialogContent></Dialog>
    <DeleteConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) { deletion.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); } }} isLoading={deletion.isPending} title="Xoá quyền hạn" description="Chỉ xoá được quyền tuỳ chỉnh chưa gán cho vai trò nào. Thao tác này không thể hoàn tác." />
  </section>;
}
