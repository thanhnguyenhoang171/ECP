'use client';

import React from 'react';

import { Badge, DataTable, FormSection, type ColumnDef } from '@/components/common';
import { formatCurrency } from '@/lib/formatters';
import { ProductDetail } from '../types/product.interface';

interface ProductInventoryTableProps {
  readonly inventory: ProductDetail['skus'];
}

const columns: ColumnDef<ProductDetail['skus'][number]>[] = [
  { header: 'Mã SKU', accessorKey: 'skuCode', className: 'font-mono text-xs' },
  { header: 'Phân loại', cell: (sku) => sku.variantName || 'Mặc định' },
  { header: 'Giá bán', align: 'right', cell: (sku) => formatCurrency(sku.price) },
  { header: 'Tồn kho', align: 'right', cell: (sku) => sku.stockQuantity.toLocaleString('vi-VN') },
  {
    header: 'Trạng thái',
    cell: (sku) => (
      <Badge variant={sku.active ? 'default' : 'secondary'}>
        {sku.active ? 'Đang bán' : 'Ngừng bán'}
      </Badge>
    ),
  },
];

export const ProductInventoryTable = ({ inventory }: ProductInventoryTableProps): React.JSX.Element => (
  <FormSection title='Tồn kho theo SKU' description='Giá và tồn kho hiện tại của các biến thể đã lưu.'>
    <DataTable
      columns={columns}
      data={inventory}
      emptyState={{ title: 'Chưa có dữ liệu tồn kho' }}
    />
  </FormSection>
);
