'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { useAuthStore } from '@/store/authStore';
import { systemApi } from '../api/system.api';
import { usePurgePasswordStatus } from '../hooks/use-purge-password-status';
import { PurgePasswordApprovals } from './PurgePasswordApprovals';

export const PurgePasswordSettings = (): React.JSX.Element => {
  const status = usePurgePasswordStatus();
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const configured = status.data?.configured === true;
  const mutation = useMutation({
    mutationFn: systemApi.setPurgePassword,
    onSuccess: async () => {
      setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setError('');
      await queryClient.invalidateQueries({ queryKey: ['purge-password-status', userId] });
      toast.success('Đã lưu mật khẩu xoá dữ liệu');
    },
    onError: (cause: Error) => setError(getApiErrorMessage(cause, 'Không thể lưu mật khẩu xoá dữ liệu')),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!status.isSuccess || mutation.isPending) { return; }
    setError('');
    if (!newPassword.trim() || newPassword.length < 8 || new TextEncoder().encode(newPassword).length > 72) {
      setError('Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte.'); return;
    }
    if (newPassword !== confirmation) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (configured && !currentPassword.trim()) { setError('Vui lòng nhập mật khẩu xoá dữ liệu hiện tại.'); return; }
    mutation.mutate({ currentPassword: configured ? currentPassword : undefined, newPassword });
  };

  return (
    <Card className='border border-slate-300/80 shadow-md bg-slate-100/95 rounded-2xl'>
      <CardHeader className='border-b border-slate-200/80 bg-slate-200/50'>
        <CardTitle className='text-slate-900 text-lg font-bold'>Mật khẩu xoá dữ liệu</CardTitle>
        <CardDescription className='text-slate-500 text-xs'>Mật khẩu riêng dùng để xác nhận thao tác xoá dữ liệu hệ thống. Tạo mật khẩu này trước khi sử dụng mục “Xoá dữ liệu” trong menu tài khoản.</CardDescription>
      </CardHeader>
      <CardContent className='pt-6 space-y-5'>
        {status.isPending ? <p role='status' className='text-sm text-slate-500'>Đang kiểm tra cấu hình mật khẩu...</p>
          : status.isError ? <div className='space-y-3'><p role='alert' className='text-sm text-red-600'>{getApiErrorMessage(status.error, 'Không thể kiểm tra quyền quản lý mật khẩu xoá dữ liệu')}</p><Button type='button' variant='outline' onClick={() => { void status.refetch(); }}>Thử lại</Button></div>
            : <form onSubmit={handleSubmit} className='space-y-5'>
              <p className={`text-sm font-medium ${status.data?.approved ? 'text-emerald-700' : 'text-amber-700'}`}>
                {configured ? (status.data?.approved ? 'Mật khẩu đã được phép sử dụng để xoá dữ liệu.' : 'Mật khẩu đang chờ admin duyệt. Chức năng xoá dữ liệu đang bị khoá.') : 'Chưa thiết lập mật khẩu. Chức năng xoá dữ liệu đang bị khoá.'}
              </p>
              {!status.data?.canApprove && <p className='text-sm text-slate-600'>Mỗi lần tạo hoặc đổi mật khẩu xoá dữ liệu đều cần admin phê duyệt trước khi sử dụng.</p>}
              {configured && (
                <div className='grid gap-5 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='current-purge-password' className='text-slate-700 font-bold text-xs uppercase tracking-wider'>Mật khẩu xoá dữ liệu hiện tại</Label>
                    <PasswordInput
                      id='current-purge-password'
                      autoComplete='current-password'
                      placeholder='••••••••'
                      className='h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                      required
                      maxLength={72}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      disabled={mutation.isPending}
                    />
                  </div>
                </div>
              )}
              <div className='grid gap-5 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='new-purge-password' className='text-slate-700 font-bold text-xs uppercase tracking-wider'>Mật khẩu xoá dữ liệu mới</Label>
                  <PasswordInput
                    id='new-purge-password'
                    autoComplete='new-password'
                    placeholder='••••••••'
                    className='h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                    required
                    minLength={8}
                    maxLength={72}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={mutation.isPending}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-purge-password' className='text-slate-700 font-bold text-xs uppercase tracking-wider'>Xác nhận mật khẩu xoá dữ liệu</Label>
                  <PasswordInput
                    id='confirm-purge-password'
                    autoComplete='new-password'
                    placeholder='••••••••'
                    className='h-11 bg-white border-slate-300 shadow-xs text-slate-900 font-medium rounded-xl focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600'
                    required
                    minLength={8}
                    maxLength={72}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    disabled={mutation.isPending}
                  />
                </div>
              </div>
              {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
              <div className='flex justify-end pt-3'>
                <Button type='submit' variant='secondary' disabled={mutation.isPending} className='gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl px-6 h-11 text-xs uppercase tracking-wider cursor-pointer'>
                  {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <KeyRound className='h-4 w-4' />}
                  {configured ? 'Đổi mật khẩu xoá dữ liệu' : 'Tạo mật khẩu xoá dữ liệu'}
                </Button>
              </div>
            </form>}
        {status.data?.canApprove && <PurgePasswordApprovals />}
      </CardContent>
    </Card>
  );
};
