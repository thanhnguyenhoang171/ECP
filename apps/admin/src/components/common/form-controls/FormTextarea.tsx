'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[90px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-xs transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:border-slate-400',
          className
        )}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';
