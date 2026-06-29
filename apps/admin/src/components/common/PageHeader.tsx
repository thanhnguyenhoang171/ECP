'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  action,
  actions,
  className
}: PageHeaderProps) => {
  const finalActions = action || actions;
  return (
    <div className={cn("space-y-1.5 mb-6", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm font-medium text-slate-500">
              {description}
            </p>
          )}
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
