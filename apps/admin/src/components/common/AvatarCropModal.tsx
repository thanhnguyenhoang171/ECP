'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Loader2 } from 'lucide-react';
import { getCroppedImg } from '@/lib/cropImage';
import { toast } from 'sonner';

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedFile: File) => void;
}

export function AvatarCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropCompleteInternal = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsCropping(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (croppedFile) {
        onCropComplete(croppedFile);
        onClose();
      } else {
        toast.error('Không thể cắt hình ảnh, vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Error cropping image:', e);
      toast.error('Có lỗi xảy ra khi cắt hình ảnh.');
    } finally {
      setIsCropping(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isCropping && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-bold text-slate-900">
            Chỉnh sửa & Cắt ảnh đại diện
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Sử dụng thao tác kéo rê, phóng to hoặc xoay để điều chỉnh hình ảnh hoàn hảo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-5 py-2">
          {/* React Easy Crop Viewport Container */}
          <div className="relative w-full h-[280px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={true}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteInternal}
            />
          </div>

          {/* Controls: Zoom & Rotation */}
          <div className="w-full space-y-3 px-2">
            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <ZoomOut size={16} className="text-slate-400 shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <ZoomIn size={16} className="text-slate-400 shrink-0" />
            </div>

            {/* Rotation and Status Buttons */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700 transition-colors"
                >
                  <RotateCcw size={12} /> Xoay trái
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700 transition-colors"
                >
                  <RotateCw size={12} /> Xoay phải
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isCropping} type="button">
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isCropping} type="button">
            {isCropping ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Đang cắt...
              </>
            ) : (
              'Cắt & Sử dụng'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarCropModal;
