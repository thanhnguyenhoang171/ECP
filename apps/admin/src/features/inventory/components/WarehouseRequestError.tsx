'use client';

import type { JSX } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/constants/errorMessages';

export const WarehouseRequestError = ({ error, retry }: { readonly error: unknown; readonly retry?: () => void }): JSX.Element | null => {
  if (!error) { return null; }
  return <div role='alert' className='flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
    <AlertCircle className='h-5 w-5 shrink-0' />
    <p className='min-w-0 flex-1'>{getApiErrorMessage(error, 'Không thể tải dữ liệu. Vui lòng thử lại.')}</p>
    {retry && <Button type='button' variant='outline' size='sm' onClick={retry}>Thử lại</Button>}
  </div>;
};
