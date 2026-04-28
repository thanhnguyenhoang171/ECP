'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, Accept, FileRejection } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  Eye, 
  File as FileIcon, 
  Image as ImageIcon,
  FileCode,
  Loader2
} from 'lucide-react';
import { Button } from './index';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: Accept; // Mặc định undefined = tất cả các loại file
  maxSize?: number; // bytes
  maxFiles?: number;
  description?: string;
  className?: string;
  disabled?: boolean;
  progress?: number; // 0 - 100
  isUploading?: boolean;
  onPreview?: (file: File) => void;
}

export const FileUpload = ({
  value,
  onChange,
  accept, // Bỏ mặc định excel để hỗ trợ tất cả
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  description = 'Hỗ trợ tất cả định dạng (Tối đa 10MB)',
  className,
  disabled = false,
  progress = 0,
  isUploading = false,
  onPreview,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(value || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync internal state with prop value
  useEffect(() => {
    setFile(value || null);
    if (value) {
      // Chỉ tạo preview cho hình ảnh
      if (value.type.startsWith('image/')) {
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onChange(selectedFile);
    }
  }, [onChange]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      const { errors } = rejection;
      if (errors[0]?.code === 'file-invalid-type') {
        toast.error('Định dạng file không được hỗ trợ');
      } else if (errors[0]?.code === 'file-too-large') {
        const sizeInMb = (maxSize / (1024 * 1024)).toFixed(0);
        toast.error(`Dung lượng file không được vượt quá ${sizeInMb}MB`);
      } else {
        toast.error(errors[0]?.message);
      }
    });
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxFiles,
    multiple: maxFiles > 1,
    maxSize,
    disabled: disabled || isUploading
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onChange(null);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!file) return;

    if (onPreview) {
      onPreview(file);
    } else {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-6 w-6" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-blue-500" />;
    if (file.type === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return <FileCode className="h-6 w-6 text-green-600" />;
    return <FileIcon className="h-6 w-6 text-slate-500" />;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('w-full space-y-3', className)}>
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer outline-none flex flex-col items-center justify-center gap-3 w-full overflow-hidden',
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : file 
                ? 'border-slate-200 bg-white' 
                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50',
            (disabled || isUploading) && 'opacity-60 cursor-not-allowed pointer-events-none'
          )}
        >
          <input {...getInputProps()} />
          
          {!file ? (
            <>
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className={cn('h-6 w-6', isDragActive ? 'text-blue-500' : 'text-slate-500')} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {isDragActive ? 'Thả file vào đây' : 'Nhấn để chọn file hoặc kéo thả vào đây'}
                </p>
                {description && (
                  <p className="text-xs text-slate-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    getFileIcon()
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-bold text-slate-700 truncate block w-full cursor-default">
                        {file.name}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {file.name}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  {!isUploading && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600"
                            onClick={handlePreview}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Xem nhanh file</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Gỡ bỏ file này</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>

              {/* Uploading State */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-blue-600 font-medium flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang tải lên...
                    </span>
                    <span className="text-slate-500 font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success State */}
              {!isUploading && file && (
                <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-bold bg-green-50 w-fit px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã tải lên thành công
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
