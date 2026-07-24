'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'date' | 'datetime-local';
  iconClassName?: string;
}

const formatInputValue = (val: unknown, inputType: 'date' | 'datetime-local'): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }

  if (typeof val === 'string') {
    if (inputType === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }
    if (inputType === 'datetime-local' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) {
      return val;
    }
  }

  const d = val instanceof Date ? val : new Date(val as string);
  if (isNaN(d.getTime())) {
    return typeof val === 'string' ? val : '';
  }

  const pad = (n: number): string => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());

  if (inputType === 'date') {
    return `${year}-${month}-${day}`;
  }

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, type = 'date', iconClassName, value, ...props }, ref) => {
    const formattedValue = formatInputValue(value, type);

    return (
      <div className="relative flex items-center w-full">
        <Input
          type={type}
          ref={ref}
          value={formattedValue}
          className={cn(
            'bg-white border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10 text-xs font-medium cursor-pointer shadow-xs',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer',
            className
          )}
          {...props}
        />
        <Calendar 
          size={16} 
          className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none', iconClassName)} 
        />
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

