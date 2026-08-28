'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2", className)}>
      {items.length === 0 ? (
        <span className="text-slate-900 font-bold">
          Tổng quan
        </span>
      ) : (
        <>
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
            Tổng quan
          </Link>
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-bold">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </nav>
  );
};
