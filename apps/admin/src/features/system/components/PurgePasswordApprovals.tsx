'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { systemApi } from '../api/system.api';
import { usePurgePasswordApprovals } from '../hooks/use-purge-password-approvals';

export const PurgePasswordApprovals = (): React.JSX.Element => {
  const queryClient = useQueryClient();
  const pending = usePurgePasswordApprovals();
  const approval = useMutation({
    mutationFn: systemApi.approvePassword,
    onSuccess: async () => {
      toast.success('Đã duyệt mật khẩu xoá dữ liệu');
      await queryClient.invalidateQueries({ queryKey: ['purge-password-approvals'] });
    },
    onError: async (error: Error) => {
      toast.error(getApiErrorMessage(error, 'Không thể duyệt mật khẩu xoá dữ liệu'));
      await queryClient.invalidateQueries({ queryKey: ['purge-password-approvals'] });
    },
  });

  return (
    <section id='purge-password-approvals' className='mt-8 space-y-4 border-t border-slate-300 pt-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-lg font-semibold'>Duyệt mật khẩu xoá dữ liệu</h3>
        <Button type='button' variant='outline' disabled={pending.isFetching} onClick={() => { void pending.refetch(); }}>Tải lại</Button>
      </div>
      <p className='text-sm text-slate-600'>Duyệt để cho phép tài khoản sử dụng mật khẩu xoá dữ liệu vừa thiết lập. Tài khoản vẫn cần có quyền xoá dữ liệu hệ thống.</p>
      {pending.isPending && <p role='status'>Đang tải yêu cầu...</p>}
      {pending.isError && <p role='alert' className='text-sm text-red-600'>{getApiErrorMessage(pending.error, 'Không thể tải danh sách chờ duyệt')}</p>}
      {pending.isSuccess && pending.data.length === 0 && <p className='text-sm text-slate-500'>Không có yêu cầu chờ duyệt.</p>}
      {pending.data?.map((request) => (
        <div key={request.userId} className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 p-4'>
          <div className='min-w-0'>
            <p className='break-all font-medium'>{request.email}</p>
            <p className='text-sm text-slate-500'>Gửi lúc: {new Date(request.updatedAt).toLocaleString('vi-VN')}</p>
          </div>
          <Button type='button' disabled={approval.isPending} onClick={() => approval.mutate({ userId: request.userId, version: request.version })}>
            {approval.isPending && approval.variables?.userId === request.userId ? 'Đang duyệt...' : 'Duyệt cho phép xoá'}
          </Button>
        </div>
      ))}
    </section>
  );
};
