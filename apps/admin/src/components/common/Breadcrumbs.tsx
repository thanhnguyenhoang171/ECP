'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
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
  showHome?: boolean;
}

export const Breadcrumbs = ({
  items = [],
  className,
  showHome = true,
}: BreadcrumbsProps) => {
  const normalizedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    return items.filter((item, idx) => {
      if (idx === 0 && showHome) {
        const norm = item.label ? item.label.trim().toLowerCase() : '';
        if (
          norm === 'trang chủ' ||
          norm === 'tổng quan' ||
          item.href === '/' ||
          item.href === '/dashboard'
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, showHome]);

  if (!normalizedItems || (normalizedItems.length === 0 && !showHome)) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1 text-xs font-medium text-slate-500 mb-3 overflow-x-auto custom-scrollbar py-0.5',
        className
      )}
    >
      <ol className="flex items-center gap-1 shrink-0 flex-wrap">
        {showHome && (
          <li className="inline-flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-slate-600 hover:text-blue-600 hover:bg-slate-100/80 font-medium',
                normalizedItems.length === 0 && 'font-bold text-slate-900 bg-slate-100'
              )}
              title="Tổng quan"
            >
              <Home className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span>Tổng quan</span>
            </Link>
          </li>
        )}

        {normalizedItems.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active ?? isLast;
          const ItemIcon = item.icon;

          return (
            <li key={index} className="inline-flex items-center gap-1">
              {(showHome || index > 0) && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-0.5 select-none" />
              )}

              {item.href && !isActive ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100/80 transition-colors max-w-[200px] sm:max-w-[260px] truncate"
                  title={item.label}
                >
                  {ItemIcon && <ItemIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-slate-900 max-w-[220px] sm:max-w-[320px] truncate',
                    isActive && 'bg-slate-100/90 text-slate-900'
                  )}
                  title={item.label}
                >
                  {ItemIcon && <ItemIcon className="w-3.5 h-3.5 shrink-0 text-slate-700" />}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
