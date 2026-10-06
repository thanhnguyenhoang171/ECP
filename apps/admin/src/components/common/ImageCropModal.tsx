'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '@/lib/cropImage';

export interface ImageCropModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly imageSrc: string | null;
  readonly file?: File | null;
  readonly aspectRatio?: number;
  readonly cropShape?: 'rect' | 'round';
  readonly targetWidth?: number;
  readonly targetHeight?: number;
  readonly lockAspect?: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly onCropSave: (croppedFile: File) => void | Promise<void>;
  readonly isSaving?: boolean;
}

interface AspectPreset {
  readonly label: string;
  readonly value: number | undefined;
}

const DEFAULT_ASPECT_PRESETS: readonly AspectPreset[] = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: 'Tự do', value: undefined },
];

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  file,
  aspectRatio,
  cropShape = 'rect',
  targetWidth,
  targetHeight,
  lockAspect = false,
  title = 'Chỉnh sửa & Cắt ảnh',
  description = 'Kéo để di chuyển vùng chọn, dùng thanh trượt hoặc cuộn chuột để phóng to/thu nhỏ.',
  onCropSave,
  isSaving = false,
}) => {
  const initialAspect = aspectRatio ?? (targetWidth && targetHeight ? targetWidth / targetHeight : 1);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(initialAspect);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync aspect ratio when modal opens or initialAspect changes
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCurrentAspect(initialAspect);
    }
  }, [isOpen, initialAspect]);

  const onCropCompleteHandler = useCallback((_croppedArea: Area, areaPixels: Area): void => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleReset = (): void => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCurrentAspect(initialAspect);
  };

  const handleRotate = (): void => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirmCrop = async (): Promise<void> => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    try {
      setIsProcessing(true);
      const outputType = file?.type || 'image/jpeg';
      const originalName = file?.name || 'cropped-image.jpg';

      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, {
        rotation,
        outputType,
        fileName: originalName,
        targetWidth,
        targetHeight,
      });

      if (croppedFile) {
        await onCropSave(croppedFile);
      }
    } catch (error) {
      console.error('Error during image crop:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) {
    return null;
  }

  const isLoading = isSaving || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-xl w-[95vw] p-0 overflow-hidden bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl gap-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Crop size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Cropper Viewport */}
        <div className="relative w-full h-84 sm:h-96 bg-slate-950 flex items-center justify-center overflow-hidden select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={currentAspect}
            cropShape={cropShape}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            classes={{
              containerClassName: 'relative w-full h-full',
              cropAreaClassName:
                cropShape === 'round'
                  ? '!border-2 !border-white !shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] !rounded-full'
                  : '!border-2 !border-white !shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] !rounded-lg',
            }}
          />

          {targetWidth && targetHeight && (
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20 pointer-events-none shadow-md">
              <Sparkles size={12} className="text-blue-400" />
              Chuẩn {targetWidth}x{targetHeight}px
            </div>
          )}
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
          {/* Aspect Presets (if not strictly locked) */}
          {!lockAspect && (
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tỷ lệ khung:
              </span>
              <div className="flex items-center gap-1.5">
                {DEFAULT_ASPECT_PRESETS.map((preset) => {
                  const isSelected =
                    (preset.value === undefined && currentAspect === undefined) ||
                    (preset.value !== undefined && currentAspect !== undefined && Math.abs(preset.value - currentAspect) < 0.01);

                  return (
                    <Button
                      key={preset.label}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => setCurrentAspect(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shrink-0 shadow-sm"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
              title="Thu nhỏ"
            >
              <ZoomOut size={16} />
            </Button>

            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shrink-0 shadow-sm"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
              title="Phóng to"
            >
              <ZoomIn size={16} />
            </Button>
          </div>

          {/* Secondary Tools: Rotate & Reset */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="h-8 px-3 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-1.5 shadow-sm"
              >
                <RotateCw size={13} /> Xoay 90°
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl gap-1.5"
              >
                <RotateCcw size={13} /> Khôi phục
              </Button>
            </div>

            <span className="text-xs font-bold text-slate-600 font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border-slate-200 rounded-xl px-4 h-9 shadow-sm"
          >
            Hủy
          </Button>

          <Button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-5 h-9 gap-2 shadow-md shadow-blue-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Check size={14} /> Áp dụng & Lưu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
