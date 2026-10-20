import { z } from 'zod';

export const isImageFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

const firstString = (...values: unknown[]): string | undefined =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);

// Normalize the image shapes returned by uploads and older API responses.
// Unknown objects stay invalid instead of becoming "[object Object]" or clearing an image.
export const normalizeImageValue = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || isImageFile(value)) { return value; }
  if ('file' in value && isImageFile(value.file)) { return value.file; }
  const url = firstString(
    'secure_url' in value ? value.secure_url : undefined,
    'url' in value ? value.url : undefined,
    'src' in value ? value.src : undefined,
  );
  if (url !== undefined || ('url' in value && value.url === '')) {
    return {
      url: url ?? '',
      publicId: firstString(
        'publicId' in value ? value.publicId : undefined,
        'public_id' in value ? value.public_id : undefined,
      ),
    };
  }
  return value;
};

export const imageValueSchema = z.preprocess(normalizeImageValue, z.union([
  z.string(),
  z.object({ url: z.string(), publicId: z.string().optional() }),
  z.custom<File>(isImageFile, { message: 'Vui lòng chọn tệp ảnh hoặc đường dẫn ảnh hợp lệ' }),
], { errorMap: () => ({ message: 'Vui lòng chọn tệp ảnh hoặc đường dẫn ảnh hợp lệ' }) }).nullish());

export type ImageInput = z.infer<typeof imageValueSchema>;

export interface ImageReference {
  readonly url: string;
  readonly publicId?: string;
}

export const getImageUrl = (value: unknown): string => {
  const image = normalizeImageValue(value);
  if (typeof image === 'string') { return image; }
  return image && typeof image === 'object' && 'url' in image && typeof image.url === 'string' ? image.url : '';
};

export const getImageReference = (value: unknown): ImageReference => {
  const image = imageValueSchema.parse(value);
  if (isImageFile(image)) { throw new Error('Tệp ảnh cần được tải lên trước khi lưu đường dẫn'); }
  return typeof image === 'string' ? { url: image } : image ?? { url: '' };
};
