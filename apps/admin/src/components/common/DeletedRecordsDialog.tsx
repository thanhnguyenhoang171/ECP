'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArchiveRestore, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { clientFetch } from '@/lib/clientFetch';
import { ApiError, getApiErrorMessage } from '@/constants/errorMessages';
import { PageResponse } from '@/types/pagination';
import { RecordAudit } from './record-audit';

export type RecoveryModule = 'products' | 'categories' | 'brands' | 'users' | 'suppliers' | 'warehouses' | 'purchase-orders' | 'goods-receipt';
interface DeletedRecord {
  id: string;
  label: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
const request = async <T,>(path: string, method = 'GET'): Promise<T> => {
  const response = await clientFetch(path, { method, skipToast: true });
  const result: T & { code?: string; message?: string } = await response.json();
  if (!response.ok) { throw new ApiError(result.code || 'RESTORE_FAILED', result.message || 'Không thể xử lý dữ liệu đã xoá.', response.status); }
  return result;
};

export default function DeletedRecordsDialog({ module }: { readonly module: RecoveryModule }): React.JSX.Element {
  const user = useAuthStore(state => state.user);
  const admin = [...(user?.roles || []), user?.role || ''].some(role => role.replace(/^ROLE_/i, '').toUpperCase() === 'SUPER_ADMIN');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [confirming, setConfirming] = useState<DeletedRecord | null>(null);
  const client = useQueryClient();
  const rows = useQuery({ queryKey: ['deleted-records', module, page], enabled: open && admin,
    queryFn: () => request<PageResponse<DeletedRecord>>(`v1/admin/deleted-records/${module}?page=${page}&size=20`), staleTime: 0 });
  const restore = useMutation({ mutationFn: (id: string) => request<{ success: boolean }>(`v1/admin/deleted-records/${module}/${encodeURIComponent(id)}/restore`, 'POST'),
    onSuccess: () => { toast.success('Đã khôi phục bản ghi.'); setConfirming(null); setPage(0); void client.invalidateQueries(); },
    onError: error => { toast.error(getApiErrorMessage(error, 'Không thể khôi phục bản ghi.')); },
  });
  if (!admin) { return <></>; }
  return <>
    <div className="flex justify-end border-b p-3"><Button variant="outline" size="sm" onClick={() => setOpen(true)}><ArchiveRestore size={15} className="mr-2" />Đã xoá mềm</Button></div>
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) { setConfirming(null); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl"><DialogHeader><DialogTitle>Dữ liệu đã xoá mềm</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Khôi phục bản ghi và kích hoạt lại tài khoản, sản phẩm hoặc danh mục. Chứng từ được giữ nguyên trạng thái nghiệp vụ và không tự cập nhật tồn kho.</p>
        {rows.isError ? <div role="alert" className="text-sm text-red-500">{getApiErrorMessage(rows.error, 'Không thể tải dữ liệu.')} <Button variant="outline" onClick={() => { void rows.refetch(); }}>Thử lại</Button></div> : rows.isLoading ? <p className="py-8 text-center text-sm">Đang tải dữ liệu...</p> :
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground">{['Bản ghi', 'Thông tin thao tác', 'Thao tác'].map(label => <th className="p-3 whitespace-nowrap" key={label}>{label}</th>)}</tr></thead><tbody>
            {(rows.data?.data || []).map(item => <tr key={item.id} className="border-b"><td className="p-3"><p className="font-medium">{item.label}</p><code className="text-[10px] text-muted-foreground">{item.id}</code></td><td className="p-3"><RecordAudit item={item} /></td><td className="p-3"><Button size="sm" variant="outline" disabled={restore.isPending} onClick={() => setConfirming(item)}><RotateCcw size={14} className="mr-2" />Khôi phục</Button></td></tr>)}
            {!rows.data?.data.length && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Không có dữ liệu đã xoá mềm.</td></tr>}
          </tbody></table></div>}
        {confirming && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><p className="text-sm">Khôi phục <strong>{confirming.label}</strong>?</p><div className="flex gap-2"><Button variant="ghost" disabled={restore.isPending} onClick={() => setConfirming(null)}>Huỷ</Button><Button disabled={restore.isPending} onClick={() => restore.mutate(confirming.id)}>{restore.isPending ? 'Đang khôi phục...' : 'Xác nhận khôi phục'}</Button></div></div>}
        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{rows.data?.pagination.totalElements || 0} bản ghi · Trang {page + 1}/{Math.max(1, rows.data?.pagination.totalPages || 0)}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 0 || rows.isFetching || restore.isPending} onClick={() => setPage(value => value - 1)}>Trước</Button><Button size="sm" variant="outline" disabled={rows.isFetching || restore.isPending || !rows.data || page + 1 >= rows.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Sau</Button></div></div>
      </DialogContent>
    </Dialog>
  </>;
}
