'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { usePurgePasswordApprovals } from '../hooks/use-purge-password-approvals';

const APPROVALS_URL = '/profile?tab=purge#purge-password-approvals';

export const PurgeApprovalNotifications = (): React.JSX.Element | null => {
  const { user, isInitialized } = useAuthStore();
  const pending = usePurgePasswordApprovals();
  const isAdmin = user?.roles?.some((role) => role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN') === true;
  const count = pending.data?.length ?? 0;

  if (!isInitialized || !isAdmin) {
    return null;
  }

  return (
    <DropdownMenu modal={false} onOpenChange={(open) => { if (open) { void pending.refetch(); } }}>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={pending.isError ? 'Thông báo: không thể tải yêu cầu chờ duyệt' : `Thông báo: ${count} yêu cầu chờ duyệt mật khẩu xoá dữ liệu`}
          className='relative shrink-0 text-slate-400 hover:bg-slate-800 hover:text-white'
        >
          <Bell size={20} aria-hidden='true' />
          {count > 0 && (
            <span aria-hidden='true' className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-900'>
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={12} className='w-80 max-w-[calc(100vw-2rem)] rounded-xl border-slate-800 bg-slate-900 p-2 text-slate-200 shadow-2xl'>
        <DropdownMenuLabel className='px-3 py-2 text-sm font-bold text-white'>Thông báo</DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-slate-800' />
        {pending.isPending && <p role='status' className='px-3 py-4 text-sm text-slate-400'>Đang tải thông báo...</p>}
        {pending.isError && (
          <div className='space-y-2 px-3 py-4'>
            <p role='alert' className='text-sm text-rose-400'>Không thể tải yêu cầu chờ duyệt.</p>
            <Button type='button' variant='ghost' disabled={pending.isFetching} onClick={() => { void pending.refetch(); }} className='text-sky-400 hover:bg-slate-800 hover:text-sky-300'>Thử lại</Button>
          </div>
        )}
        {pending.isSuccess && count === 0 && <p className='px-3 py-4 text-sm text-slate-400'>Không có thông báo nào</p>}
        {!pending.isError && pending.data?.slice(0, 5).map((request) => (
          <DropdownMenuItem key={request.userId} asChild className='cursor-pointer items-start gap-3 rounded-lg px-3 py-3 focus:bg-slate-800 focus:text-white'>
            <Link href={APPROVALS_URL}>
              <KeyRound size={18} className='mt-0.5 shrink-0 text-amber-400' aria-hidden='true' />
              <span className='min-w-0 whitespace-normal'>
                <span className='block break-all text-sm font-semibold'>{request.email}</span>
                <span className='mt-1 block text-xs text-slate-400'>Đang chờ duyệt mật khẩu xoá dữ liệu</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        {count > 0 && !pending.isError && (
          <>
            <DropdownMenuSeparator className='bg-slate-800' />
            <DropdownMenuItem asChild className='cursor-pointer justify-center rounded-lg py-2 text-sky-400 focus:bg-slate-800 focus:text-sky-300'>
              <Link href={APPROVALS_URL}>Xem tất cả {count} yêu cầu chờ duyệt</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
