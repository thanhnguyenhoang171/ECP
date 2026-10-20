'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductFormValues } from '../../schemas/product.schema';

interface ProductVideoUploadProps {
  readonly value: ProductFormValues['videos'];
  readonly onChange: (videos: ProductFormValues['videos']) => void;
  readonly disabled?: boolean;
}

interface VideoPreviewProps {
  readonly video: ProductFormValues['videos'][number];
}

const VideoPreview = ({ video }: VideoPreviewProps): React.JSX.Element => {
  const source = useMemo(() => video instanceof File ? URL.createObjectURL(video) : video.url, [video]);
  useEffect(() => () => {
    if (video instanceof File) {
      URL.revokeObjectURL(source);
    }
  }, [source, video]);

  return <video src={source} controls playsInline preload='metadata' className='block aspect-video max-h-72 w-full rounded-xl bg-black object-contain' aria-label='Xem trước video sản phẩm' />;
};

export const ProductVideoUpload = ({ value, onChange, disabled = false }: ProductVideoUploadProps): React.JSX.Element => {
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (disabled || files.length === 0) {
      return;
    }
    if (files.some((file) => !['video/mp4', 'video/webm'].includes(file.type) || file.size === 0 || file.size > 50 * 1024 * 1024)) {
      setError('Vui lòng chọn video MP4 hoặc WebM, mỗi video tối đa 50 MB.');
      return;
    }
    setError('');
    onChange([...value, ...files]);
  };

  return (
    <div className='space-y-4'>
      <input ref={inputRef} type='file' accept='video/mp4,video/webm' multiple disabled={disabled} onChange={handleSelect} aria-label='Tệp video sản phẩm' hidden />
      <button type='button' disabled={disabled} aria-label='Chọn video sản phẩm' onClick={() => inputRef.current?.click()} className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${disabled ? 'opacity-50' : 'cursor-pointer hover:border-blue-500'}`}>
        <Film className='h-7 w-7 text-blue-600' aria-hidden='true' />
        <span className='text-sm font-semibold text-slate-700'>Chọn video sản phẩm</span>
        <span className='text-xs text-slate-500'>MP4, WebM · Tối đa 50 MB/video · Tải lên khi lưu sản phẩm</span>
      </button>
      {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
      {value.map((video, index) => (
        <div key={index} className='space-y-2 rounded-xl border border-slate-200 p-3'>
          <VideoPreview video={video} />
          <div className='flex items-center justify-between gap-2'>
            <span className='min-w-0 truncate text-xs text-slate-600'>{video instanceof File ? video.name : `Video ${index + 1}`}</span>
            <Button type='button' variant='ghost' size='sm' disabled={disabled} aria-label={`Xoá video ${index + 1}`} onClick={() => { setError(''); onChange(value.filter((_, videoIndex) => videoIndex !== index)); }} className='shrink-0 gap-1 text-red-600'>
              <Trash2 size={14} /> Xoá
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
