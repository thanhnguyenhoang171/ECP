export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });

const rotateSize = (
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } => {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOptions {
  rotation?: number;
  outputType?: string;
  fileName?: string;
  targetWidth?: number;
  targetHeight?: number;
}

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: PixelCrop,
  optionsOrRotation: number | CropOptions = 0
): Promise<File | null> => {
  const options: CropOptions =
    typeof optionsOrRotation === 'number'
      ? { rotation: optionsOrRotation }
      : optionsOrRotation;

  const {
    rotation = 0,
    outputType = 'image/jpeg',
    fileName = `cropped-${Date.now()}.${outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg'}`,
    targetWidth,
    targetHeight,
  } = options;

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  const destWidth = targetWidth || pixelCrop.width;
  const destHeight = targetHeight || pixelCrop.height;

  croppedCanvas.width = destWidth;
  croppedCanvas.height = destHeight;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    destWidth,
    destHeight
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], fileName, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        } else {
          resolve(null);
        }
      },
      outputType,
      0.95
    );
  });
};
