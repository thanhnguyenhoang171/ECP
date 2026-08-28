'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Move,
  Loader2,
  Crop,
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

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  file?: File | null;
  onCropSave?: (croppedFile: File) => void;
  onCropComplete?: (croppedFile: File) => void;
  isSaving?: boolean;
}

const CROP_SIZE = 280; // Size of circular crop viewport on screen in pixels

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  file,
  onCropSave,
  onCropComplete,
  isSaving = false,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset controls when modal opens/closes or source changes
  const resetControls = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetControls();
    }
  }, [isOpen, imageSrc, resetControls]);

  // Load natural dimensions when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageSrc]);

  // Handle Mouse Drag & Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Touch Drag & Pan (Mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // High-Resolution 600x600 Canvas Crop Export
  const handleSaveCroppedImage = async () => {
    if (!imageSrc || !naturalSize.width) return;

    const exportSize = 600; // Output resolution 600x600px
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Clear background
    ctx.clearRect(0, 0, exportSize, exportSize);

    // Save context state for rotation & scale transforms
    ctx.save();

    // Move to center of canvas
    ctx.translate(exportSize / 2, exportSize / 2);

    // Apply rotation angle
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale calculation mapping screen pixels to export canvas size
    const screenToCanvasScale = exportSize / CROP_SIZE;
    const scaleFactor = zoom * screenToCanvasScale;

    // Apply translation offset from screen drag position
    const transX = position.x * screenToCanvasScale;
    const transY = position.y * screenToCanvasScale;

    ctx.translate(transX, transY);

    // Base cover scaling for image
    const coverScale = Math.max(
      CROP_SIZE / naturalSize.width,
      CROP_SIZE / naturalSize.height
    );

    const renderWidth = naturalSize.width * coverScale * scaleFactor;
    const renderHeight = naturalSize.height * coverScale * scaleFactor;

    // Draw centered image onto canvas
    ctx.drawImage(
      img,
      -renderWidth / 2,
      -renderHeight / 2,
      renderWidth,
      renderHeight
    );

    ctx.restore();

    // Export high-quality JPEG Blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileName = file?.name || 'avatar-cropped.jpg';
          const croppedFile = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          const saveHandler = onCropSave || onCropComplete;
          if (saveHandler) {
            saveHandler(croppedFile);
          }
        }
      },
      'image/jpeg',
      0.95
    );
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-lg w-[95vw] p-0 overflow-hidden bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl gap-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Crop size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Chỉnh sửa ảnh đại diện
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                Kéo để di chuyển, dùng thanh trượt để phóng to/thu nhỏ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Interactive Crop & Viewport Area */}
        <div className="relative w-full h-84 sm:h-96 bg-slate-900 flex items-center justify-center overflow-hidden select-none">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Interactive Drag Window */}
          <div
            className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image element with transforms */}
            <div
              className="absolute transition-transform duration-75 ease-out pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Avatar Crop Source"
                className="max-w-none max-h-none"
                style={{
                  width: naturalSize.width
                    ? `${Math.max(CROP_SIZE, (naturalSize.width / naturalSize.height) * CROP_SIZE)}px`
                    : `${CROP_SIZE}px`,
                  height: naturalSize.height
                    ? `${Math.max(CROP_SIZE, (naturalSize.height / naturalSize.width) * CROP_SIZE)}px`
                    : `${CROP_SIZE}px`,
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* Dimmed Mask Overlay with Circular Cutout */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className="rounded-full ring-[9999px] ring-slate-950/75 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-2 border-white/90 transition-all"
              style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
            />
          </div>

          {/* Move Hint Overlay Icon */}
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20 pointer-events-none shadow-md">
            <Move size={13} className="text-blue-400" /> Kéo di chuyển
          </div>
        </div>

        {/* Controls Toolbar: Zoom Slider & Action Tools */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-3.5">
          {/* Zoom Slider Row */}
          <div className="flex items-center gap-3">
            <Button
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
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-600 border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shrink-0 shadow-sm"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
              title="Phóng to"
            >
              <ZoomIn size={16} />
            </Button>
          </div>

          {/* Secondary Action Toolbar: Rotate & Reset */}
          <div className="flex items-center justify-between pt-1">
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
                onClick={resetControls}
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
            disabled={isSaving}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border-slate-200 rounded-xl px-4 h-9 shadow-sm"
          >
            Hủy
          </Button>

          <Button
            type="button"
            onClick={handleSaveCroppedImage}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-5 h-9 gap-2 shadow-md shadow-blue-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Đang tải ảnh lên...
              </>
            ) : (
              <>
                <Check size={14} /> Lưu ảnh đại diện
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropModal;
