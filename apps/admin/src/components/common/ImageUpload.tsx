'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';
import { 
  X, 
  Plus,
  Trash2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button, Card, CardContent } from './index';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn, getCloudinaryPublicId } from '@/lib/utils';
import { useUploadFile, useUploadMultipleFiles, useDeleteFile } from '@/features/files/hooks/use-file-upload';
import { CloudinaryFile } from '@/features/files/api/file.api';

interface ImageValue {
  file?: File;
  url: string;
  publicId?: string;
}

interface ImageUploadProps {
  value?: string | File | (string | File)[]; // Can be URL string, File object, or array of either
  onChange: (value: any) => void;
  onRemove?: (url: string) => void;
  onUploadComplete?: (file: CloudinaryFile | CloudinaryFile[]) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  description?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: 'square' | 'video' | 'auto';
  variant?: 'default' | 'circle' | 'compact';
}

/**
 * A premium Image Upload component using react-dropzone.
 * Supports single/multiple images, previews, and robust validation.
 * Uses shadcn/ui components and Next.js Image for optimization.
 */
export const ImageUpload = ({
  value,
  onChange,
  onRemove,
  onUploadComplete,
  folder,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  description = 'Kéo thả ảnh hoặc nhấn để chọn',
  className,
  disabled = false,
  aspectRatio = 'square',
  variant = 'default'
}: ImageUploadProps) => {
  const [internalImages, setInternalImages] = useState<ImageValue[]>([]);

  const { mutateAsync: uploadFile, isPending: isUploadingSingle } = useUploadFile();
  const { mutateAsync: uploadMultiple, isPending: isUploadingMultiple } = useUploadMultipleFiles();
  const { mutate: deleteFile } = useDeleteFile();
  const isUploading = isUploadingSingle || isUploadingMultiple;

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      internalImages.forEach(img => {
        if (img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [internalImages]);

  // Effect to sync internal state with external 'value' prop
  useEffect(() => {
    // 1. Normalize external value to an array
    const externalValues = value 
      ? (Array.isArray(value) ? value : [value])
      : [];

    // 2. Check if internal state is already in sync with external values
    const isSync = externalValues.length === internalImages.length && 
      externalValues.every((ext, i) => {
        const int = internalImages[i];
        if (typeof ext === 'string') return ext === int.url;
        if (ext instanceof File) return ext === int.file;
        return false;
      });

    if (isSync) return;

    // 3. Only if not in sync, create new internal state
    const newInternalImages: ImageValue[] = externalValues.map(ext => {
      if (typeof ext === 'string') {
        return { url: ext };
      } else if (ext instanceof File) {
        const existing = internalImages.find(img => img.file === ext);
        if (existing) return existing;
        
        return {
          file: ext,
          url: URL.createObjectURL(ext)
        };
      }
      return { url: '' };
    }).filter(img => img.url !== '');

    setInternalImages(newInternalImages);
  }, [value]); // Removed internalImages from dependencies to prevent infinite loops

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      if (multiple) {
        const res = await uploadMultiple({ files: acceptedFiles, folder });
        if (res.success && res.data) {
          const newImages = res.data.map(file => ({
            url: file.secure_url,
            publicId: file.public_id,
          }));

          const updatedImages = [...internalImages, ...newImages].slice(0, maxFiles);
          setInternalImages(updatedImages);
          onChange(updatedImages.map(img => img.url));
          if (onUploadComplete) {
            onUploadComplete(res.data);
          }
        }
      } else {
        const fileToUpload = acceptedFiles[0];
        const res = await uploadFile({ file: fileToUpload, folder });
        if (res.success && res.data) {
          const secureUrl = res.data.secure_url;
          setInternalImages([{ url: secureUrl, publicId: res.data.public_id }]);
          onChange(secureUrl);
          if (onUploadComplete) {
            onUploadComplete(res.data);
          }
        }
      }
    } catch (error) {
      console.error("Upload error in onDrop:", error);
    }
  }, [multiple, maxFiles, internalImages, onChange, uploadFile, uploadMultiple, folder, onUploadComplete]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    fileRejections.forEach((rejection) => {
      const { errors, file } = rejection;
      if (errors[0]?.code === 'file-invalid-type') {
        toast.error(`"${file.name}" không phải là định dạng hình ảnh hợp lệ.`);
      } else if (errors[0]?.code === 'file-too-large') {
        const sizeInMb = (maxSize / (1024 * 1024)).toFixed(0);
        toast.error(`Ảnh "${file.name}" quá lớn. Giới hạn là ${sizeInMb}MB.`);
      } else {
        toast.error(errors[0]?.message);
      }
    });
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
    },
    maxFiles: multiple ? maxFiles - internalImages.length : 1,
    multiple: multiple,
    maxSize,
    disabled: disabled || isUploading || (!multiple && internalImages.length > 0) || (multiple && internalImages.length >= maxFiles)
  });

  const handleRemove = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Lấy publicId đã được lưu trước đó từ response của upload API, hoặc trích xuất từ URL làm phương án dự phòng
    const item = internalImages.find(img => img.url === url);
    const publicId = item?.publicId || getCloudinaryPublicId(url);
    
    if (publicId) {
      deleteFile(publicId);
    }

    const updatedImages = internalImages.filter(img => img.url !== url);
    setInternalImages(updatedImages);
    
    if (multiple) {
      onChange(updatedImages.map(img => img.file || img.url));
    } else {
      onChange('');
    }
    
    if (onRemove) onRemove(url);
  };

  const renderSinglePreview = () => (
    <div className={cn(
      "relative w-full group overflow-hidden border-2 border-slate-100 shadow-lg ring-1 ring-black/5 animate-in zoom-in-95 duration-200",
      variant === 'circle' ? 'rounded-full' : 'rounded-2xl',
      aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : 'h-full'
    )}>
      <Image 
        src={internalImages[0].url} 
        alt="Preview" 
        fill 
        unoptimized={internalImages[0].url.startsWith('blob:')}
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon" 
                  className="h-10 w-10 rounded-full shadow-xl bg-white hover:bg-slate-100 text-slate-900 border-none"
                  onClick={(e) => { e.stopPropagation(); window.open(internalImages[0].url, '_blank'); }}
                >
                  <Maximize2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem ảnh gốc</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="h-10 w-10 rounded-full shadow-xl"
                  onClick={(e) => handleRemove(internalImages[0].url, e)}
                >
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gỡ bỏ ảnh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Success Badge */}
      <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
        <CheckCircle2 size={14} />
      </div>
    </div>
  );

  const renderMultiPreview = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {internalImages.map((img, i) => (
        <div key={img.url} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 group shadow-md animate-in zoom-in-95 duration-200">
          <Image 
            src={img.url} 
            alt={`Preview ${i}`} 
            fill 
            unoptimized={img.url.startsWith('blob:')}
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          
          <button 
            type="button"
            className="absolute top-2 right-2 h-7 w-7 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:bg-red-50"
            onClick={(e) => handleRemove(img.url, e)}
          >
            <X size={14} strokeWidth={3} />
          </button>
          
          <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded-lg border border-white/20">
            #{i + 1}
          </div>
        </div>
      ))}
      
      {internalImages.length < maxFiles && (
        <Card 
          {...getRootProps()}
          className={cn(
            "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-none",
            isDragActive 
              ? "border-primary bg-primary/5 scale-[0.98]" 
              : "border-slate-200 bg-slate-50/50 hover:border-primary hover:bg-white hover:shadow-inner",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <CardContent className="p-2 flex flex-col items-center justify-center w-full h-full text-center">
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary mb-1" />
            ) : (
              <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                + Thêm ảnh
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={cn("w-full group/container", className)}>
      {!multiple && internalImages.length > 0 ? (
        renderSinglePreview()
      ) : multiple && internalImages.length > 0 ? (
        renderMultiPreview()
      ) : (
        <Card 
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-0 text-center overflow-hidden shadow-none",
            isDragActive 
              ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
              : isDragReject 
                ? "border-destructive bg-destructive/5"
                : "border-slate-200 bg-slate-50/30 hover:border-primary hover:bg-white hover:shadow-lg hover:-translate-y-0.5",
            disabled && "opacity-50 cursor-not-allowed grayscale",
            aspectRatio === 'square' ? "aspect-square" : aspectRatio === 'video' ? "aspect-video" : "min-h-[140px]"
          )}
        >
          <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center w-full h-full">
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-2 p-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-xs font-bold text-slate-500">Đang tải...</p>
              </div>
            ) : (
              <div className="space-y-1 md:space-y-1.5 relative z-10 w-full px-2">
                <p className="text-xs md:text-sm font-bold text-slate-700 tracking-tight line-clamp-1">
                  {isDragActive ? "Thả ngay để tải lên" : "Tải ảnh lên hệ thống"}
                </p>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium max-w-[180px] mx-auto leading-normal line-clamp-2">
                  {description}
                </p>
                <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 rounded px-1.5 py-0.5 mt-0.5 uppercase tracking-wider">
                  Tối đa {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </span>
              </div>
            )}

            {/* Drag rejection indicator */}
            {isDragReject && (
              <div className="absolute inset-0 bg-destructive/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in">
                <div className="bg-white p-2.5 rounded-xl shadow-xl flex items-center gap-2 max-w-[90%]">
                  <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                  <p className="text-destructive font-bold text-[10px] leading-tight">Định dạng không hỗ trợ!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Empty State for Multiple Mode (when no images yet) */}
      {multiple && internalImages.length === 0 && !isDragActive && (
        <Card 
          {...getRootProps()}
          className="border-2 border-dashed border-slate-200 rounded-2xl transition-all duration-300 cursor-pointer group/empty shadow-none"
        >
          <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50/50 hover:border-primary hover:bg-white hover:shadow-lg transition-all w-full min-h-[140px]">
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-slate-500">Đang tải ảnh lên Cloudinary...</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm md:text-base font-bold text-slate-700">Bộ sưu tập ảnh đang trống</p>
                <p className="text-xs text-slate-400 font-medium">{description}</p>
                <Button type="button" variant="outline" size="sm" className="mt-4 gap-2 border-slate-200 bg-white hover:bg-primary hover:text-white hover:border-primary transition-all rounded-xl px-5 py-1.5 text-xs font-bold shadow-sm">
                  Chọn ảnh ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

