'use client';

import React from 'react';
import { ImageCropModal } from './ImageCropModal';

interface AvatarCropModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly imageSrc: string | null;
  readonly file?: File | null;
  readonly onCropSave?: (croppedFile: File) => void;
  readonly onCropComplete?: (croppedFile: File) => void;
  readonly isSaving?: boolean;
}

export const AvatarCropModal = ({ onCropSave, onCropComplete, ...props }: AvatarCropModalProps): React.JSX.Element => (
  <ImageCropModal
    {...props}
    aspectRatio={1}
    cropShape='round'
    targetWidth={600}
    targetHeight={600}
    lockAspect
    onCropSave={(croppedFile) => {
      const onSave = onCropSave ?? onCropComplete;
      onSave?.(croppedFile);
    }}
  />
);

export default AvatarCropModal;
