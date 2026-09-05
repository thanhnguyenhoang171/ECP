'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
  note?: React.ReactNode | null;
}

export const EmptyState = ({
  title,
  description,
  icon,
  iconColor = 'bg-muted',
  className,
  note,
}: EmptyStateProps) => {
  return (
    <div className={cn('flex items-center justify-center min-h-100', className)}>
      <Card className="w-full max-w-md border-dashed border-slate-200 shadow-none">
        <CardHeader className="text-center">
          {icon && (
            <div className={cn('mx-auto p-3 rounded-full w-fit mb-4', iconColor)}>
              {icon}
            </div>
          )}
          <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
          <CardDescription className="whitespace-normal wrap-break-word text-slate-500">{description}</CardDescription>
        </CardHeader>
        {note !== null && (
          <CardContent className="text-center text-sm text-slate-400 italic">
            {note ?? 'Vui lòng quay lại sau!'}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
