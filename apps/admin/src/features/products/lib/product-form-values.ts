import { ProductFormValues } from '../schemas/product.schema';
import { Product } from '../types/product.interface';

export const productImageUrl = (image: unknown): string => {
  if (typeof image === 'string') {
    return image;
  }
  return image && typeof image === 'object' && 'url' in image && typeof image.url === 'string' ? image.url : '';
};

const toPairs = (value: unknown): Array<{ key: string; value: string }> => {
  if (Array.isArray(value)) {
    return value.flatMap((item: unknown) => item && typeof item === 'object' && 'key' in item && 'value' in item
      ? [{ key: String(item.key), value: String(item.value ?? '') }] : []);
  }
  return value && typeof value === 'object'
    ? Object.entries(value).map(([key, entry]) => ({ key, value: String(entry ?? '') }))
    : [];
};

export const getProductFormValues = (product?: Product): ProductFormValues => ({
  sku: product?.sku || '',
  name: product?.name || '',
  slug: product?.slug || '',
  brand: typeof product?.brand === 'string' ? product.brand : product?.brand?.name || '',
  brandId: product?.brandId || (typeof product?.brand === 'object' ? product.brand?.id : '') || '',
  categoryId: product?.categoryId || (typeof product?.category === 'object' ? product.category?.id : '') || '',
  description: product?.description || '',
  thumbnail: product?.thumbnail || '',
  images: product?.images || [],
  specifications: toPairs(product?.specifications),
  isPublished: product?.isPublished ?? product?.published ?? true,
  isFeatured: product?.isFeatured ?? product?.featured ?? false,
  isNew: product?.isNew ?? product?.new ?? false,
  isBestSeller: product?.isBestSeller ?? product?.bestSeller ?? false,
  viewCount: product?.viewCount ?? 0,
  soldCount: product?.soldCount ?? 0,
  ratingAvg: product?.ratingAvg ?? 0,
  ratingCount: product?.ratingCount ?? 0,
  metaTitle: product?.metaTitle || '',
  metaDescription: product?.metaDescription || '',
  metaKeywords: product?.metaKeywords || '',
  variants: product?.variants?.length ? product.variants.map((variant) => ({
    skuId: variant.skuId,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? 0,
    costPrice: variant.costPrice ?? 0,
    barcode: variant.barcode || '',
    barcodeType: variant.barcodeType || 'EAN-13',
    image: productImageUrl(variant.image),
    isActive: variant.isActive ?? variant.active ?? true,
    attributes: toPairs(variant.attributes),
  })) : [{ sku: '', price: 0, compareAtPrice: 0, costPrice: 0, barcode: '', barcodeType: 'EAN-13', image: '', isActive: true, attributes: [] }],
});
