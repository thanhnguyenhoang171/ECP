import React from 'react';
import { toRichTextHtml } from '@/utils/rich-text';

interface ProductDescriptionProps {
  readonly description?: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps): React.JSX.Element => {
  const html = toRichTextHtml(description);
  return html ? <div className='rich-text-content min-w-0 text-slate-600' dangerouslySetInnerHTML={{ __html: html }} />
    : <p className='text-sm text-slate-500'>Chưa có mô tả cho sản phẩm này.</p>;
};
