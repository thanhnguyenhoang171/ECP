'use client';

import React from 'react';
import { formatDate } from '@/lib/formatters';

export const recordValue = (item: unknown, key: string): unknown => {
  if (typeof item !== 'object' || item === null) { return undefined; }
  return Reflect.get(item, key);
};

export const actorEmail = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) { return 'Chưa ghi nhận'; }
  if (!value.trim().startsWith('{')) { return value; }
  try {
    const parsed: unknown = JSON.parse(value);
    const email = recordValue(parsed, 'email');
    return typeof email === 'string' && email ? email : 'Chưa ghi nhận';
  } catch (error) {
    console.warn('Không thể đọc thông tin người thao tác.', error);
    return 'Chưa ghi nhận';
  }
};

export function RecordAudit({ item }: { readonly item: unknown }): React.JSX.Element {
  const entries = [
    { label: 'Tạo', actor: 'createdBy', time: 'createdAt' },
    { label: 'Sửa', actor: 'updatedBy', time: 'updatedAt' },
    { label: 'Xoá', actor: 'deletedBy', time: 'deletedAt' },
  ];
  return <div className="min-w-48 space-y-2 text-xs">
    {entries.map(entry => {
      const timestamp = recordValue(item, entry.time);
      return <div key={entry.actor} className="flex items-start gap-2">
        <span className="w-7 shrink-0 text-muted-foreground">{entry.label}:</span>
        <div><p className="font-medium">{actorEmail(recordValue(item, entry.actor))}</p>
          {typeof timestamp === 'string' && timestamp && <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(timestamp)}</p>}
        </div>
      </div>;
    })}
  </div>;
}
