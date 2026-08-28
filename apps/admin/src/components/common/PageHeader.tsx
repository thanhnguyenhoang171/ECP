'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  action,
  actions,
  showBackButton,
  onBack,
  className
}: PageHeaderProps) => {
  const router = useRouter();
  const finalActions = action || actions;
  const handleBack = onBack || (() => router.back());

  return (
    <div className={cn("space-y-1.5 mb-6", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex items-start gap-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mt-1 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Quay lại"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs font-medium text-slate-500 leading-relaxed mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        {finalActions && (
          <div className="flex items-center gap-2">
            {finalActions}
          </div>
        )}
      </div>
    </div>
  );
};
