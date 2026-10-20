'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { useLogout } from '@/features/auth/hooks/use-auth-mutation';
import { systemApi } from '../api/system.api';
import { usePurgePasswordStatus } from '../hooks/use-purge-password-status';

interface PurgeDataDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export const PurgeDataDialog = ({ open, onClose }: PurgeDataDialogProps): React.JSX.Element => {
  const status = usePurgePasswordStatus(open);
  const queryClient = useQueryClient();
  const logout = useLogout();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: systemApi.purge,
    onSuccess: async () => {
      setPassword('');
      toast.success('Đã xoá dữ liệu. Vui lòng đăng nhập lại.');
      queryClient.clear();
      await logout.mutateAsync();
    },
    onError: (cause: Error) => {
      setPassword('');
      setError(getApiErrorMessage(cause, 'Không thể xoá dữ liệu'));
    },
  });
  const isBusy = mutation.isPending || logout.isPending;
  const canPurge = status.isSuccess && status.data.configured && status.data.approved && Boolean(password.trim()) && !isBusy;

  const handleClose = (): void => {
    if (isBusy) { return; }
    setPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canPurge) { return; }
    setError('');
    mutation.mutate(password);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) { handleClose(); } }}>
      <DialogContent onEscapeKeyDown={(event) => { if (isBusy) { event.preventDefault(); } }} onPointerDownOutside={(event) => { if (isBusy) { event.preventDefault(); } }}>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-red-600'><Trash2 className='h-5 w-5' />Xoá dữ liệu hệ thống</DialogTitle>
          <DialogDescription>Thao tác này xoá vĩnh viễn dữ liệu nghiệp vụ và các tài khoản hiện tại, sau đó khởi tạo lại tài khoản mặc định. Bạn sẽ được đăng xuất sau khi hoàn tất.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-5'>
          {status.isPending && <p role='status' className='text-sm text-slate-500'>Đang kiểm tra mật khẩu xoá dữ liệu...</p>}
          {status.isError && <div className='space-y-2'><p role='alert' className='text-sm text-red-600'>{getApiErrorMessage(status.error, 'Không thể kiểm tra quyền xoá dữ liệu')}</p><Button type='button' variant='outline' onClick={() => { void status.refetch(); }}>Thử lại</Button></div>}
          {status.isSuccess && !status.data.configured && <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2'>
            <p className='text-sm text-amber-900'>Chưa có mật khẩu xoá dữ liệu. Bạn cần tạo mật khẩu trong Hồ sơ cá nhân trước khi thực hiện thao tác này.</p>
            <Link href='/profile?tab=purge' className='inline-block text-sm font-semibold text-blue-700 underline' onClick={handleClose}>Tạo mật khẩu tại Hồ sơ cá nhân</Link>
          </div>}
          {status.isSuccess && status.data.configured && !status.data.approved && <p role='status' className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900'>Mật khẩu xoá dữ liệu đang chờ admin phê duyệt. Bạn chưa thể xoá dữ liệu.</p>}
          {status.isSuccess && status.data.configured && status.data.approved && <div className='space-y-2'>
            <Label htmlFor='purge-confirm-password' className='text-slate-700 font-bold text-xs uppercase tracking-wider'>Mật khẩu xoá dữ liệu</Label>
            <PasswordInput placeholder='••••••••' className='h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600' id='purge-confirm-password' autoComplete='current-password' required maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} disabled={isBusy} autoFocus />
            <p className='text-xs text-slate-500'>Nhập mật khẩu xoá dữ liệu đã thiết lập tại trang Hồ sơ cá nhân.</p>
          </div>}
          {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isBusy}>Huỷ</Button>
            <Button type='submit' variant='destructive' disabled={!canPurge} className='gap-2'>
              {isBusy ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
              {isBusy ? 'Đang xoá dữ liệu...' : 'Xác nhận xoá dữ liệu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
