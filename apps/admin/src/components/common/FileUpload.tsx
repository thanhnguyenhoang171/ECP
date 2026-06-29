'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import Image from 'next/image';
import { 
  X, 
  CheckCircle2, 
  Eye, 
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Button, Card, CardContent } from './index';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileValue {
  file?: File;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface FileUploadProps {
  value?: File | File[] | null;
  onChange: (value: any) => void;
  onRemove?: (file: any) => void;
  accept?: Accept;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  description?: string;
  className?: string;
  disabled?: boolean;
  isUploading?: boolean;
  progress?: number;
}

/**
 * A premium File Upload component using react-dropzone.
 * Supports all file types, list view with icons, progress bars, and robust validation.
 * Uses shadcn/ui components and Next.js Image for small previews.
 */
export const FileUpload = ({
  value,
  onChange,
  onRemove,
  accept,
  multiple = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  description = 'Kéo thả file hoặc nhấn để chọn',
  className,
  disabled = false,
  isUploading = false,
  progress = 0
}: FileUploadProps) => {
  const [internalFiles, setInternalFiles] = useState<FileValue[]>([]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      internalFiles.forEach(f => {
        if (f.url.startsWith('blob:')) {
          URL.revokeObjectURL(f.url);
        }
      });
    };
  }, [internalFiles]);

  // Sync internal state with external 'value' prop
  useEffect(() => {
    if (!value) {
      if (internalFiles.length > 0) {
        setInternalFiles([]);
      }
      return;
    }

    const values = Array.isArray(value) ? value : [value];
    
    // Only sync if these are new File objects we haven't processed yet
    const currentFiles = internalFiles.map(f => f.file).filter(Boolean);
    const hasChanged = values.length !== currentFiles.length || 
                      values.some((v, i) => v !== currentFiles[i]);

    if (hasChanged) {
      const processed = values.map(f => ({
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
      }));
      setInternalFiles(processed);
    }
  }, [value]); // Removed internalFiles from dependencies to prevent loops

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      const updatedFiles = [...(Array.isArray(value) ? value : []), ...acceptedFiles].slice(0, maxFiles);
      onChange(updatedFiles);
    } else {
      onChange(acceptedFiles[0]);
    }
  }, [multiple, maxFiles, value, onChange]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      const { errors, file } = rejection;
      if (errors[0]?.code === 'file-invalid-type') {
        toast.error(`"${file.name}" không đúng định dạng yêu cầu.`);
      } else if (errors[0]?.code === 'file-too-large') {
        const sizeInMb = (maxSize / (1024 * 1024)).toFixed(0);
        toast.error(`File "${file.name}" quá lớn. Giới hạn là ${sizeInMb}MB.`);
      } else {
        toast.error(errors[0]?.message);
      }
    });
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxFiles: multiple ? maxFiles - internalFiles.length : 1,
    multiple: multiple,
    maxSize,
    disabled: disabled || isUploading || (!multiple && internalFiles.length > 0)
  });

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const removedFile = internalFiles[index].file;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const updatedValues = currentValues.filter((_, i) => i !== index);
      onChange(updatedValues);
    } else {
      onChange(null);
    }
    
    if (onRemove) onRemove(removedFile);
  };



  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderFileList = () => (
    <div className="w-full space-y-3">
      {internalFiles.map((file, i) => (
        <Card key={i} className="border-slate-100 shadow-sm overflow-hidden group/item animate-in slide-in-from-top-1 duration-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              {/* Preview or File Extension Text */}
              <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                {file.url ? (
                  <Image src={file.url} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <span className="font-extrabold text-[10px] tracking-wider text-slate-500 uppercase">
                    {file.name.split('.').pop()?.substring(0, 4) || 'FILE'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                  {isUploading && i === internalFiles.length - 1 && (
                    <Badge className="bg-blue-50 text-blue-600 border-none px-1.5 py-0 h-4 text-[9px] font-black uppercase">
                      Đang tải...
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {formatSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!isUploading && (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => file.url && window.open(file.url, '_blank')}
                          >
                            <Eye size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem chi tiết</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => handleRemove(i, e)}
                          >
                            <X size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Gỡ bỏ</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar (Global or item specific - here simplified as global) */}
            {isUploading && i === internalFiles.length - 1 && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-blue-600">
                  <span>Tiến trình tải lên</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {multiple && internalFiles.length < maxFiles && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12 border-dashed border-2 border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all rounded-xl gap-2 font-bold text-xs"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <Plus size={16} /> Thêm tệp tin khác ({internalFiles.length}/{maxFiles})
        </Button>
      )}
    </div>
  );

  return (
    <div className={cn("w-full group/container", className)}>
      {internalFiles.length > 0 ? (
        renderFileList()
      ) : (
        <Card 
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-0 text-center overflow-hidden shadow-none outline-none",
            isDragActive 
              ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[0.99]" 
              : isDragReject 
                ? "border-destructive bg-destructive/5"
                : "border-slate-200 bg-slate-50/30 hover:border-primary hover:bg-white hover:shadow-lg hover:-translate-y-0.5",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed grayscale pointer-events-none"
          )}
        >
          <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center w-full min-h-[140px]">
            <input {...getInputProps()} />
            
            <div className="space-y-1.5 relative z-10 w-full px-2">
              <p className="text-sm md:text-base font-bold text-slate-700 tracking-tight">
                {isDragActive ? "Thả ngay để tải lên" : "Tải tệp tin lên hệ thống"}
              </p>
              <p className="text-xs md:text-sm text-slate-400 font-medium max-w-[280px] mx-auto leading-normal">
                {description}
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 rounded px-1.5 py-0.5 mt-1 uppercase tracking-wider">
                Tối đa {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </span>
            </div>

            {/* Drag rejection indicator */}
            {isDragReject && (
              <div className="absolute inset-0 bg-destructive/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in">
                <div className="bg-white p-3 rounded-xl shadow-xl flex items-center gap-2 max-w-[90%]">
                  <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                  <p className="text-destructive font-bold text-xs leading-tight">Định dạng tệp không được hỗ trợ!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Badge for single file mode */}
      {!multiple && internalFiles.length > 0 && !isUploading && (
        <div className="mt-3 flex items-center gap-2 text-emerald-600 font-bold text-[11px] animate-in fade-in slide-in-from-left-2">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={12} />
          </div>
          Tệp tin đã sẵn sàng để xử lý
        </div>
      )}
    </div>
  );
};

// Helper component for badges if not imported
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", className)}>
    {children}
  </span>
);
