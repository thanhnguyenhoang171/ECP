'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { TableKit } from '@tiptap/extension-table';
import ImageExtension from '@tiptap/extension-image';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Redo2, RemoveFormatting, Strikethrough, Table2, Underline, Undo2, Unlink, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getApiErrorMessage } from '@/constants/errorMessages';
import { fileApi } from '@/features/files/api/file.api';
import { sanitizeRichText, toRichTextHtml } from '@/lib/rich-text';

interface RichTextEditorProps extends React.AriaAttributes {
  readonly id?: string;
  readonly value?: string;
  readonly onChange: (value: string) => void;
  readonly onBlur?: () => void;
  readonly disabled?: boolean;
  readonly onUploadingChange?: (uploading: boolean) => void;
}

interface ToolButtonProps {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly active?: boolean;
  readonly disabled: boolean;
  readonly onClick: () => void;
}

const ToolButton = ({ label, icon: Icon, active, disabled, onClick }: ToolButtonProps): React.JSX.Element => (
  <button type='button' title={label} aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'}`}>
    <Icon size={16} aria-hidden='true' />
  </button>
);

const colorInputValue = (value: string | undefined, fallback: string): string => {
  if (value && /^#[0-9a-f]{6}$/i.test(value)) { return value; }
  const channels = value?.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  return channels ? `#${channels.slice(1, 4).map((channel) => Math.min(255, Number(channel)).toString(16).padStart(2, '0')).join('')}` : fallback;
};

export const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ id, value = '', onChange, onBlur, disabled = false, onUploadingChange, ...ariaProps }, ref): React.JSX.Element => {
    const [uploading, setUploading] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkError, setLinkError] = useState('');
    const imageInput = useRef<HTMLInputElement>(null);
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false } }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        TextStyleKit,
        TableKit.configure({ table: { resizable: false } }),
        ImageExtension.configure({ allowBase64: false }),
      ],
      content: toRichTextHtml(value),
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: { id: id || 'product-description', role: 'textbox', 'aria-label': 'Mô tả chi tiết sản phẩm', 'aria-multiline': 'true', class: 'rich-text-content min-h-64 max-h-[32rem] overflow-y-auto px-4 py-3 text-slate-800 focus:outline-none' },
        transformPastedHTML: sanitizeRichText,
      },
      onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
      onBlur: () => onBlur?.(),
    });
    const state = useEditorState({ editor, selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      underline: current?.isActive('underline') ?? false,
      strike: current?.isActive('strike') ?? false,
      bullet: current?.isActive('bulletList') ?? false,
      ordered: current?.isActive('orderedList') ?? false,
      quote: current?.isActive('blockquote') ?? false,
      link: current?.isActive('link') ?? false,
      table: current?.isActive('table') ?? false,
      heading: [1, 2, 3].find((level) => current?.isActive('heading', { level })) ?? 0,
      alignment: ['left', 'center', 'right', 'justify'].find((alignment) => current?.isActive({ textAlign: alignment })) ?? 'left',
      color: String(current?.getAttributes('textStyle').color ?? '#1e293b'),
      background: String(current?.getAttributes('textStyle').backgroundColor ?? '#ffffff'),
      fontSize: String(current?.getAttributes('textStyle').fontSize ?? ''),
      undo: current?.can().undo() ?? false,
      redo: current?.can().redo() ?? false,
    }) });

    useEffect(() => {
      if (editor && editor.getHTML() !== value) {
        const html = toRichTextHtml(value);
        if (editor.getHTML() !== html) { editor.commands.setContent(html, { emitUpdate: false }); }
      }
    }, [editor, value]);
    useEffect(() => { editor?.setEditable(!disabled, false); }, [editor, disabled]);

    const busy = !editor || disabled || uploading;
    const insertImage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !editor || busy) { return; }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
        toast.error('Vui lòng chọn ảnh JPG, PNG, WebP hoặc GIF, tối đa 5 MB.');
        return;
      }
      setUploading(true);
      onUploadingChange?.(true);
      try {
        const result = await fileApi.uploadFile(file, 'products');
        const url = result.data?.secure_url || result.data?.url;
        if (!result.success || !url) { throw new Error('Không thể tải ảnh lên'); }
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Không thể chèn ảnh vào mô tả'));
      } finally {
        setUploading(false);
        onUploadingChange?.(false);
      }
    };

    const saveLink = (): void => {
      if (!editor) { return; }
      const text = linkUrl.trim();
      if (!text) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); return; }
      try {
        const href = /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`;
        const url = new URL(href);
        if (!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) { throw new Error('Đường dẫn không hợp lệ'); }
        editor.chain().focus().extendMarkRange('link').setLink({ href, target: '_blank' }).run();
        setLinkOpen(false);
      } catch {
        setLinkError('Vui lòng nhập liên kết HTTP, HTTPS, email hoặc số điện thoại hợp lệ.');
      }
    };

    return (
      <div ref={ref} {...ariaProps} className='min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20'>
        <fieldset disabled={busy} aria-label='Công cụ định dạng mô tả' className='flex min-w-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2'>
          <ToolButton label='Hoàn tác' icon={Undo2} disabled={busy || !state?.undo} onClick={() => { editor?.chain().focus().undo().run(); }} />
          <ToolButton label='Làm lại' icon={Redo2} disabled={busy || !state?.redo} onClick={() => { editor?.chain().focus().redo().run(); }} />
          <select aria-label='Kiểu đoạn văn' value={state?.heading ?? 0} onChange={(event) => {
            const level = Number(event.target.value);
            if (level === 1 || level === 2 || level === 3) { editor?.chain().focus().setHeading({ level }).run(); }
            else { editor?.chain().focus().setParagraph().run(); }
          }} className='mx-1 h-8 max-w-32 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700'>
            <option value={0}>Văn bản thường</option><option value={1}>Tiêu đề 1</option><option value={2}>Tiêu đề 2</option><option value={3}>Tiêu đề 3</option>
          </select>
          <select aria-label='Cỡ chữ' value={state?.fontSize ?? ''} onChange={(event) => {
            if (event.target.value) { editor?.chain().focus().setFontSize(event.target.value).run(); }
            else { editor?.chain().focus().unsetFontSize().run(); }
          }} className='h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700'>
            <option value=''>Cỡ chữ</option>{[12, 14, 16, 18, 24, 32, 48].map((size) => <option key={size} value={`${size}px`}>{size}</option>)}
          </select>
          <ToolButton label='In đậm' icon={Bold} active={state?.bold} disabled={busy} onClick={() => { editor?.chain().focus().toggleBold().run(); }} />
          <ToolButton label='In nghiêng' icon={Italic} active={state?.italic} disabled={busy} onClick={() => { editor?.chain().focus().toggleItalic().run(); }} />
          <ToolButton label='Gạch chân' icon={Underline} active={state?.underline} disabled={busy} onClick={() => { editor?.chain().focus().toggleUnderline().run(); }} />
          <ToolButton label='Gạch ngang' icon={Strikethrough} active={state?.strike} disabled={busy} onClick={() => { editor?.chain().focus().toggleStrike().run(); }} />
          <label title='Màu chữ' className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-200'><input type='color' aria-label='Màu chữ' value={colorInputValue(state?.color, '#1e293b')} onChange={(event) => { editor?.chain().focus().setColor(event.target.value).run(); }} className='h-6 w-6 cursor-pointer border-0 bg-transparent' /></label>
          <label title='Màu nền chữ' className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-200'><input type='color' aria-label='Màu nền chữ' value={colorInputValue(state?.background, '#ffffff')} onChange={(event) => { editor?.chain().focus().setBackgroundColor(event.target.value).run(); }} className='h-6 w-6 cursor-pointer border-0 bg-transparent' /></label>
          {([{ value: 'left', label: 'Căn trái', icon: AlignLeft }, { value: 'center', label: 'Căn giữa', icon: AlignCenter }, { value: 'right', label: 'Căn phải', icon: AlignRight }, { value: 'justify', label: 'Căn đều', icon: AlignJustify }]).map(({ value: alignment, label, icon }) => <ToolButton key={alignment} label={label} icon={icon} active={state?.alignment === alignment} disabled={busy} onClick={() => { editor?.chain().focus().setTextAlign(alignment).run(); }} />)}
          <ToolButton label='Danh sách dấu đầu dòng' icon={List} active={state?.bullet} disabled={busy} onClick={() => { editor?.chain().focus().toggleBulletList().run(); }} />
          <ToolButton label='Danh sách đánh số' icon={ListOrdered} active={state?.ordered} disabled={busy} onClick={() => { editor?.chain().focus().toggleOrderedList().run(); }} />
          <ToolButton label='Trích dẫn' icon={Quote} active={state?.quote} disabled={busy} onClick={() => { editor?.chain().focus().toggleBlockquote().run(); }} />
          <Popover open={linkOpen} onOpenChange={(open) => { setLinkOpen(open); setLinkError(''); if (open) { setLinkUrl(String(editor?.getAttributes('link').href ?? '')); } }}>
            <PopoverTrigger asChild><button type='button' title='Chèn liên kết' aria-label='Chèn liên kết' aria-pressed={state?.link} disabled={busy} onMouseDown={(event) => event.preventDefault()} className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 ${state?.link ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}><Link2 size={16} /></button></PopoverTrigger>
            <PopoverContent className='space-y-3' align='start'>
              <Label htmlFor={`${id}-link`}>Đường dẫn liên kết</Label><Input id={`${id}-link`} value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder='https://example.com' onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); saveLink(); } }} />
              {linkError && <p role='alert' className='text-xs text-red-600'>{linkError}</p>}
              <div className='flex justify-end gap-2'><Button type='button' size='sm' variant='outline' onClick={() => setLinkOpen(false)}>Huỷ</Button><Button type='button' size='sm' onClick={saveLink}>Áp dụng liên kết</Button></div>
            </PopoverContent>
          </Popover>
          <ToolButton label='Bỏ liên kết' icon={Unlink} disabled={busy || !state?.link} onClick={() => { editor?.chain().focus().unsetLink().run(); }} />
          <ToolButton label='Chèn bảng' icon={Table2} disabled={busy || Boolean(state?.table)} onClick={() => { editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }} />
          <ToolButton label='Chèn ảnh vào mô tả' icon={ImagePlus} disabled={busy} onClick={() => imageInput.current?.click()} />
          <ToolButton label='Xoá định dạng' icon={RemoveFormatting} disabled={busy} onClick={() => { editor?.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run(); }} />
        </fieldset>
        {state?.table && <div className='flex flex-wrap gap-1 border-b border-slate-200 bg-blue-50/50 px-3 py-2'>
          {[
            { label: 'Thêm hàng', action: () => { editor?.chain().focus().addRowAfter().run(); } },
            { label: 'Thêm cột', action: () => { editor?.chain().focus().addColumnAfter().run(); } },
            { label: 'Xoá hàng', action: () => { editor?.chain().focus().deleteRow().run(); } },
            { label: 'Xoá cột', action: () => { editor?.chain().focus().deleteColumn().run(); } },
            { label: 'Xoá bảng', action: () => { editor?.chain().focus().deleteTable().run(); } },
          ].map(({ label, action }) => <button key={label} type='button' disabled={busy} onMouseDown={(event) => event.preventDefault()} onClick={action} className='rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40'>{label}</button>)}
        </div>}
        <input ref={imageInput} type='file' accept='image/jpeg,image/png,image/webp,image/gif' hidden aria-label='Ảnh chèn vào mô tả' disabled={busy} onChange={(event) => { void insertImage(event); }} />
        <EditorContent editor={editor} />
        <div role='status' className='flex items-center gap-2 border-t border-slate-100 px-4 py-2 text-xs text-slate-400'>
          {uploading ? <><Loader2 size={12} className='animate-spin' />Đang tải ảnh...</> : 'Định dạng trực tiếp hoặc dán nội dung từ Word. Ctrl+B: đậm · Ctrl+I: nghiêng · Ctrl+Z: hoàn tác.'}
        </div>
      </div>
    );
  },
);
RichTextEditor.displayName = 'RichTextEditor';
