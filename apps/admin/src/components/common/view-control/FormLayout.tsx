'use client';

import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A consistent layout section for admin forms.
 * Provides a title, optional description, and standardized spacing.
 */
export const FormSection = ({ 
  title, 
  description, 
  children, 
  className 
}: FormSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 font-medium">
            {description}
          </p>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
};

interface FormGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * A responsive grid container for form fields.
 */
export const FormGrid = ({ 
  children, 
  cols = 2, 
  className 
}: FormGridProps) => {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid gap-5", colClass, className)}>
      {children}
    </div>
  );
};

/**
 * Standardized Label for Form fields to ensure consistency.
 */
export const AdminFormLabel = ({ 
  children, 
  required, 
  className 
}: { 
  children: React.ReactNode; 
  required?: boolean; 
  className?: string;
}) => (
  <FormLabel className={cn("text-xs font-bold uppercase text-slate-500 tracking-wide", className)}>
    {children} {required && <span className="text-red-500 ml-0.5">*</span>}
  </FormLabel>
);
