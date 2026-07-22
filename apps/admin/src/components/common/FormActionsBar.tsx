'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

export interface FormActionsBarProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText: string;
  activeTabLabel?: string;
  isDialog?: boolean;
}

export function FormActionsBar({
  onCancel,
  isSubmitting = false,
  submitText,
  activeTabLabel,
  isDialog = false,
}: FormActionsBarProps) {
  const { isSidebarCollapsed } = useUIStore();

  if (isDialog) {
    return (
      <div className="mt-auto px-6 py-4 flex justify-end gap-3 bg-white/90 backdrop-blur-md border-t border-slate-200 rounded-b-2xl">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 min-w-36 shadow-lg shadow-blue-200 h-11 font-bold text-xs uppercase tracking-widest"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {submitText}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50 shadow-lg transition-all duration-200',
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      )}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
        <div className="hidden md:flex items-center gap-2">
          {activeTabLabel && (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Trang thiết lập: {activeTabLabel}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-10 font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}
