'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { useBackground } from '@/components/providers/BackgroundProvider';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  className
}: PageHeaderProps) => {
  const { currentBackground } = useBackground();

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div className="space-y-1">
        <h1 className={cn(
          "text-2xl sm:text-4xl font-black tracking-tight transition-all duration-300",
          currentBackground 
            ? "liquid-text-primary italic drop-shadow-2xl" 
            : "text-slate-900"
        )}>
          {title}
        </h1>
        {description && (
          <p className={cn(
            "text-sm font-medium transition-all duration-300",
            currentBackground 
              ? "liquid-text-secondary opacity-90" 
              : "text-slate-500"
          )}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
