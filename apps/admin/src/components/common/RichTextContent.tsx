import React from 'react';

import { cn } from '@/lib/utils';
import { toRichTextHtml } from '@/lib/rich-text';

interface RichTextContentProps {
  readonly value?: string;
  readonly className?: string;
  readonly emptyMessage?: string;
}

export const RichTextContent = ({ value, className, emptyMessage = 'Chưa có mô tả sản phẩm.' }: RichTextContentProps): React.JSX.Element => {
  const html = toRichTextHtml(value);
  return html ? <div className={cn('rich-text-content min-w-0 text-slate-600', className)} dangerouslySetInnerHTML={{ __html: html }} />
    : <p className='text-sm text-slate-400'>{emptyMessage}</p>;
};
