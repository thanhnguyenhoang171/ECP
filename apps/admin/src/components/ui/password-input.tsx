'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from './input';

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  leadingIcon?: React.ReactNode;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, id, leadingIcon, ...props }, ref): React.JSX.Element => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
      <div className='relative w-full'>
        {leadingIcon && (
          <span className='pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400'>
            {leadingIcon}
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          id={id}
          type={isVisible ? 'text' : 'password'}
          disabled={disabled}
          className={cn(leadingIcon && 'pl-10', className, 'pr-10')}
        />
        <button
          type='button'
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={isVisible}
          aria-controls={id}
          title={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsVisible((value) => !value)}
          className='absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isVisible ? <EyeOff className='h-4 w-4' aria-hidden='true' /> : <Eye className='h-4 w-4' aria-hidden='true' />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
