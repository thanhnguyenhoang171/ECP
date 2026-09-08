'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SpaciousDatePickerProps {
  readonly value?: string | null;
  readonly onChange: (dateStr: string) => void;
  readonly disabled?: boolean;
}

const MONTHS: readonly string[] = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const YEARS: readonly number[] = Array.from({ length: 77 }, (_, i) => 1950 + i); // 1950 to 2026

export const SpaciousDatePicker = ({
  value,
  onChange,
  disabled,
}: SpaciousDatePickerProps): React.JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);

  const parsedDate = value ? new Date(value) : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : 1995;
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : 4; // May

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  const handleOpenChange = (newOpen: boolean): void => {
    if (disabled) {
      return;
    }
    if (newOpen && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
    setOpen(newOpen);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number): void => {
    const pad = (n: number): string => n.toString().padStart(2, '0');
    const formatted = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    onChange(formatted);
    setOpen(false);
  };

  const handlePrevMonth = (): void => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const displayValue = value
    ? (() => {
        const parts = value.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return value;
      })()
    : '';

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all',
            disabled ? 'cursor-not-allowed bg-slate-200/60 border-slate-300 text-slate-500 opacity-90' : 'cursor-pointer'
          )}
        >
          <span className={cn(displayValue ? (disabled ? 'text-slate-600 font-semibold' : 'text-slate-900 font-semibold') : 'text-slate-400')}>
            {displayValue || 'Chọn ngày sinh...'}
          </span>
          <CalendarIcon size={18} className={disabled ? 'text-slate-400 shrink-0' : 'text-blue-600 shrink-0'} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-4 bg-white border border-slate-200 shadow-2xl rounded-2xl space-y-4">
        {/* Month & Year Selectors Header */}
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            <Select value={String(viewMonth)} onValueChange={(val) => setViewMonth(Number(val))}>
              <SelectTrigger className="h-8 text-xs font-bold bg-slate-100 border-none rounded-lg px-2 shadow-none cursor-pointer">
                <SelectValue>{MONTHS[viewMonth]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl max-h-56">
                {MONTHS.map((m, idx) => (
                  <SelectItem key={idx} value={String(idx)} className="text-xs font-medium cursor-pointer">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(viewYear)} onValueChange={(val) => setViewYear(Number(val))}>
              <SelectTrigger className="h-8 text-xs font-bold bg-slate-100 border-none rounded-lg px-2 shadow-none cursor-pointer">
                <SelectValue>{viewYear}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl max-h-56">
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs font-medium cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Day Header Labels */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
          <span>CN</span>
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const pad = (n: number): string => n.toString().padStart(2, '0');
            const dateString = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
            const isSelected = value === dateString;

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'h-9 w-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer',
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
