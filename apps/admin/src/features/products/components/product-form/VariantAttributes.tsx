'use client';

import React from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductFormValues } from '../../schemas/product.schema';

interface VariantAttributesProps {
  control: Control<ProductFormValues>;
  variantIndex: number;
}

export const VariantAttributes = ({ control, variantIndex }: VariantAttributesProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${variantIndex}.attributes` as any,
  });

  const suggestions = ['Màu sắc', 'Dung lượng', 'Kích thước'];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Thuộc tính:</h5>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-slate-500 transition-colors"
              onClick={() => append({ key: s, value: '' })}
            >
              + {s}
            </button>
          ))}
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-6 text-[10px] gap-1 text-blue-600 hover:bg-blue-50 px-2 self-start"
          onClick={() => append({ key: '', value: '' })}
        >
          <Plus size={10} /> Thêm thuộc tính khác
        </Button>
      </div>
      
      {fields.length === 0 && (
        <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200">
          Chưa cấu hình thuộc tính phân loại (Màu, Size...). Nhấp nút phía trên để thêm nhanh.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 group animate-in fade-in-30">
            <FormField
              control={control}
              name={`variants.${variantIndex}.attributes.${index}.key` as any}
              render={({ field }) => (
                <Input placeholder="Tên (vd: Màu sắc)" {...field} className="h-8 text-xs border-slate-200 focus:border-blue-500" />
              )}
            />
            <FormField
              control={control}
              name={`variants.${variantIndex}.attributes.${index}.value` as any}
              render={({ field }) => (
                <Input placeholder="Giá trị (vd: Xanh Titan)" {...field} className="h-8 text-xs border-slate-200 focus:border-blue-500" />
              )}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-300 hover:text-red-500 shrink-0"
              onClick={() => remove(index)}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
