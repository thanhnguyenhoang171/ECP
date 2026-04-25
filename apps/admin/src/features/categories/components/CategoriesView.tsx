'use client';

import React from 'react';
import { Package } from "lucide-react";
import { PageHeader, EmptyState } from '@/components/common';

export default function CategoriesView() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý danh mục"
        description="Phân loại sản phẩm để quản lý kho hiệu quả hơn."
      />
      
      <EmptyState 
        title="Tính năng đang phát triển"
        description="Trang quản lý danh mục sản phẩm sẽ sớm ra mắt với nhiều tính năng hấp dẫn."
        icon={<Package className="h-10 w-10 text-muted-foreground opacity-20" />}
      />
    </div>
  );
}
