'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Category } from '../types/category.interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentCategory: Category) => void;
}

export function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  onAddSub,
}: CategoryTreeViewProps) {
  // Build parent-child hierarchy tree
  const parentCategories = categories.filter(
    (c) => !c.parentId || c.parentId === '0' || c.level === 1
  );

  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    parentCategories.forEach((p) => {
      init[p.id] = true;
    });
    return init;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (category: Category, depth = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = Boolean(expandedIds[category.id]);
    const active = category.active ?? true;

    const thumbObj = category.image as any;
    const thumbUrl = typeof thumbObj === 'string' ? thumbObj : thumbObj?.url;

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50/80 transition-all shadow-2xs group',
            depth > 0 && 'ml-6 border-l-2 border-l-blue-500/40'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 relative">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt={category.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <Folder className="w-4 h-4 text-amber-600" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {category.name}
                </span>
                <Badge
                  className={
                    active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] py-0 px-1.5'
                      : 'bg-slate-100 text-slate-500 border-none text-[10px] py-0 px-1.5'
                  }
                >
                  {active ? 'Hoạt động' : 'Ẩn'}
                </Badge>
                {category.isFeatured && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] py-0 px-1 font-bold">
                    Nổi bật
                  </Badge>
                )}
              </div>

              <span className="text-[10px] text-slate-400 font-mono truncate">
                /{category.slug} • Cấp {category.level || depth + 1}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddSub(category)}
              className="h-7 px-2 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Sub-Category
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(category)}
              className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
              title="Chỉnh sửa"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(category.id)}
              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 pl-2">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200/80 rounded-2xl">
        <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-600">Chưa có danh mục sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-slate-50/50 p-4 border border-slate-200/80 rounded-2xl">
      {parentCategories.map((parent) => renderNode(parent, 0))}
    </div>
  );
}
