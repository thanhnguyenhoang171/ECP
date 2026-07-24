'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormattedNumberInputProps {
  value?: number | string | null;
  onChange: (numericValue: number) => void;
  placeholder?: string;
  className?: string;
  suffix?: string;
  disabled?: boolean;
  allowDecimals?: boolean;
  min?: number;
}

export function FormattedNumberInput({
  value,
  onChange,
  placeholder = '0',
  className,
  suffix,
  disabled = false,
  allowDecimals = false,
  min = 0,
}: FormattedNumberInputProps) {
  // Format numeric value into display string (e.g. 1000000 -> "1.000.000")
  const formatDisplay = (val?: number | string | null): string => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = String(val).replace(/,/g, '.');
    const num = Number(numStr);
    if (isNaN(num)) return '';

    const parts = numStr.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] !== undefined ? `,${parts[1]}` : '';

    return allowDecimals ? `${integerPart}${decimalPart}` : integerPart;
  };

  const [displayValue, setDisplayValue] = useState<string>(formatDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, allowDecimals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Filter allowed characters: numbers, dots (for existing format), comma (for decimal)
    let cleaned = rawInput.replace(/[^0-9,]/g, '');

    // Ensure only one comma for decimal
    if (allowDecimals) {
      const firstCommaIdx = cleaned.indexOf(',');
      if (firstCommaIdx !== -1) {
        cleaned =
          cleaned.substring(0, firstCommaIdx + 1) +
          cleaned.substring(firstCommaIdx + 1).replace(/,/g, '');
      }
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }

    if (!cleaned) {
      setDisplayValue('');
      onChange(min);
      return;
    }

    // Format display string with dots
    const parts = cleaned.split(',');
    const integerRaw = parts[0];
    const integerFormatted = integerRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const newDisplay = parts.length > 1 ? `${integerFormatted},${parts[1]}` : integerFormatted;

    setDisplayValue(newDisplay);

    // Parse to true numeric value for onChange
    const numericString = cleaned.replace(/,/g, '.');
    const parsedNumber = parseFloat(numericString);

    if (!isNaN(parsedNumber)) {
      onChange(parsedNumber);
    } else {
      onChange(min);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'font-mono font-medium border-slate-300 bg-white hover:border-slate-400 focus:border-blue-500 shadow-xs text-xs',
          suffix && 'pr-8',
          className
        )}
      />
      {suffix && (
        <span className="absolute right-2.5 text-xs font-bold text-slate-400 pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
