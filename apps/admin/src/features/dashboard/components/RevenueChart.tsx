'use client';

import React from 'react';

const data = [
  { label: 'T1', value: 55 },
  { label: 'T2', value: 42 },
  { label: 'T3', value: 58 },
  { label: 'T4', value: 35 },
  { label: 'T5', value: 78 },
  { label: 'T6', value: 65 },
  { label: 'T7', value: 91 },
  { label: 'T8', value: 48 },
  { label: 'T9', value: 72 },
  { label: 'T10', value: 85 },
  { label: 'T11', value: 60 },
  { label: 'T12', value: 95 },
];

export default function RevenueChart() {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="h-[250px] w-full flex items-end gap-1.5 pt-4 pb-1">
      {data.map((item, i) => {
        const heightPct = (item.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.value}%
            </span>
            <div
              className="w-full rounded-sm bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 cursor-pointer relative group"
              style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? 4 : 0 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.value}%
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
