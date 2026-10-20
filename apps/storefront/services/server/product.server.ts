import { serverFetch } from './server-fetch';
import { BackendProduct, CatalogPage, Product } from '@/types/product';

const imageUrl = (image: string | { url?: string } | null | undefined): string =>
  typeof image === 'string' ? image : image?.url || '';

export function mapBackendProductToFrontend(source: BackendProduct): Product {
  const variants = (source.variants || [])
    .filter((variant) => variant.isActive ?? variant.active ?? true)
    .map((variant) => ({ ...variant, price: Number(variant.price), image: imageUrl(variant.image) }))
    .sort((a, b) => a.price - b.price);
  const lowestPriceVariant = variants.reduce<(typeof variants)[number] | undefined>(
    (lowest, variant) => !lowest || variant.price < lowest.price ? variant : lowest, undefined,
  );
  const price = lowestPriceVariant?.price ?? 0;
  const comparison = Number(lowestPriceVariant?.compareAtPrice ?? 0);
  const images = [...new Set([imageUrl(source.thumbnail), ...(source.images || []).map(imageUrl), ...variants.map((variant) => variant.image)].filter(Boolean))];
  return {
    id: source.id,
    name: source.name,
    slug: source.slug,
    description: source.description || '',
    price,
    originalPrice: comparison > price ? comparison : undefined,
    discountPercent: comparison > price ? Math.round((comparison - price) / comparison * 100) : undefined,
    rating: Number(source.ratingAvg ?? 0),
    reviewCount: source.ratingCount ?? 0,
    images: images.length ? images : ['/product-placeholder.svg'],
    videos: (source.videos || []).filter((video) => /^https?:\/\//i.test(video.url)),
    category: typeof source.category === 'string' ? source.category : source.category?.name || source.categoryName || 'Sản phẩm',
    categoryId: source.categoryId,
    brand: typeof source.brand === 'string' ? source.brand : source.brand?.name,
    isNew: source.isNew ?? source.new ?? false,
    isFeatured: source.isFeatured ?? source.featured ?? false,
    isBestSeller: source.isBestSeller ?? source.bestSeller ?? false,
    soldCount: source.soldCount ?? 0,
    viewCount: source.viewCount ?? 0,
    ratingAvg: Number(source.ratingAvg ?? 0),
    ratingCount: source.ratingCount ?? 0,
    variants,
    specifications: source.specifications || {},
    inStock: variants.length > 0,
  };
}

export async function getProductsServer(categoryId?: string): Promise<Product[]> {
  const products: Product[] = [];
  let page = 0;
  let hasMore = true;
  while (hasMore) {
    const query = new URLSearchParams({ size: '100', page: String(page), isPublished: 'true' });
    if (categoryId) query.set('categoryId', categoryId);
    const result = await serverFetch<CatalogPage<BackendProduct>>(`/v1/storefront/products?${query}`, { revalidate: 0 });
    if (result.error || !result.data?.success || !Array.isArray(result.data.data)) {
      throw new Error('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
    }
    products.push(...result.data.data
      .filter((product) => product.isPublished ?? product.published ?? false)
      .map(mapBackendProductToFrontend));
    const pagination = result.data.pagination;
    hasMore = Boolean(pagination && !pagination.last && page + 1 < pagination.totalPages);
    page += 1;
  }
  return products;
}

export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  const result = await serverFetch<{ success: boolean; data: BackendProduct }>(
    `/v1/storefront/products/${encodeURIComponent(slug)}`, { revalidate: 0 },
  );
  if (result.status === 404) return null;
  if (result.error || !result.data?.success || !result.data.data) {
    throw new Error('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
  }
  const product = result.data.data;
  return (product.isPublished ?? product.published ?? false) ? mapBackendProductToFrontend(product) : null;
}
