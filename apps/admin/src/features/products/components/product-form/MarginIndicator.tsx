'use client';

import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Coins, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { ProductFormValues } from '../../schemas/product.schema';

interface MarginIndicatorProps {
  control: Control<ProductFormValues>;
  variantIndex: number;
}

export const MarginIndicator = ({ control, variantIndex }: MarginIndicatorProps) => {
  const price = useWatch({ control, name: `variants.${variantIndex}.price` }) || 0;
  const costPrice = useWatch({ control, name: `variants.${variantIndex}.costPrice` }) || 0;
  const compareAtPrice = useWatch({ control, name: `variants.${variantIndex}.compareAtPrice` }) || 0;

  const profit = price - costPrice;
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
  const discount = compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {costPrice > 0 && (
        <div className={cn(
          "text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1",
          profit >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        )}>
          <Coins size={10} />
          Lãi: {formatCurrency(profit)} ({margin}%)
        </div>
      )}
      {compareAtPrice > price && (
        <div className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold flex items-center gap-1">
          <TrendingUp size={10} />
          Khuyến mãi: -{discount}%
        </div>
      )}
    </div>
  );
};
