'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, LayoutDashboard, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav className={cn("flex items-center gap-2 text-sm font-medium text-slate-500 mb-2", className)}>
      {items.length === 0 ? (
        <span className="text-slate-900 font-bold flex items-center gap-1">
          <LayoutDashboard size={14} />
          <span>Tổng quan</span>
        </span>
      ) : (
        <>
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            <span>Tổng quan</span>
          </Link>
          
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  {item.icon && <item.icon size={14} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="text-slate-900 font-bold flex items-center gap-1">
                  {item.icon && <item.icon size={14} />}
                  <span>{item.label}</span>
                </span>
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </nav>
  );
};
