'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LucideIcon, X } from 'lucide-react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  suffix?: string;
  onClear?: () => void;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, leftIcon: LeftIcon, rightIcon: RightIcon, suffix, onClear, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && value !== '';

    return (
      <div className="relative flex items-center w-full">
        {LeftIcon && (
          <LeftIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}

        <Input
          ref={ref}
          value={value}
          className={cn(
            'h-10 bg-white border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs shadow-xs transition-colors',
            LeftIcon && 'pl-9',
            (RightIcon || suffix || (onClear && hasValue)) && 'pr-9',
            className
          )}
          {...props}
        />

        {onClear && hasValue ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        ) : RightIcon ? (
          <RightIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        ) : suffix ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none select-none">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
