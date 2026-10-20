'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Clock3, Loader2, RotateCcw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { backgroundTasks, useBackgroundTasksStore } from '@/store/backgroundTasksStore';
import { useAuthStore } from '@/store/authStore';

export const useBackgroundTaskLifecycle = (): void => {
  const active = useBackgroundTasksStore((state) => state.tasks.some((task) => task.status === 'running' || task.status === 'queued'));

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.user?.id !== previous.user?.id || (previous.isAuthenticated && !state.isAuthenticated)) {
        backgroundTasks.clear();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!active) { return; }
    const beforeUnload = (event: BeforeUnloadEvent): void => { event.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [active]);
};

export const BackgroundTaskNotifications = (): React.JSX.Element | null => {
  const tasks = useBackgroundTasksStore((state) => state.tasks);
  const active = tasks.some((task) => task.status === 'running' || task.status === 'queued');
  if (tasks.length === 0) { return null; }
  return (
    <div className='max-h-80 overflow-y-auto px-1' aria-label='Công việc chạy nền' aria-live='polite'>
      <p className='px-2 py-2 text-xs font-semibold text-slate-400'>Công việc chạy nền</p>
      {active && <p className='px-2 pb-2 text-xs text-slate-400'>Bạn có thể chuyển trang. Giữ tab này mở để hoàn tất công việc.</p>}
      {[...tasks].reverse().map((task) => (
        <div key={task.id} className='mb-2 rounded-lg border border-slate-800 p-3'>
          <div className='flex items-start gap-2'>
            {task.status === 'running' ? <Loader2 className='mt-0.5 h-4 w-4 shrink-0 animate-spin text-sky-400' />
              : task.status === 'succeeded' ? <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-400' />
                : task.status === 'failed' ? <CircleAlert className='mt-0.5 h-4 w-4 shrink-0 text-rose-400' />
                  : <Clock3 className='mt-0.5 h-4 w-4 shrink-0 text-slate-400' />}
            <div className='min-w-0 flex-1'>
              <p className='break-words text-sm font-medium text-slate-100'>{task.title}</p>
              <p className='mt-1 text-xs text-slate-400'>{task.stage} · {task.completed}/{task.total} tệp</p>
              {task.error && <p role='alert' className='mt-1 break-words text-xs text-rose-400'>{task.error}</p>}
              <div className='mt-2 flex items-center gap-2'>
                {task.status === 'failed' && (
                  <Button type='button' variant='ghost' size='sm' className='h-7 gap-1 text-xs text-sky-400' onClick={() => backgroundTasks.retry(task.id)}>
                    <RotateCcw className='h-3 w-3' />Thử lại
                  </Button>
                )}
                {task.href && <Link href={task.href} className='text-xs text-sky-400 hover:underline'>Xem kết quả</Link>}
              </div>
            </div>
            {['succeeded', 'failed'].includes(task.status) && (
              <button type='button' aria-label={`Ẩn công việc ${task.title}`} className='text-slate-400 hover:text-white' onClick={() => backgroundTasks.dismiss(task.id)}><X className='h-4 w-4' /></button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
