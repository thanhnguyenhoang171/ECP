import { serverFetch } from './server-fetch';
import { Product } from '@/types/product';
import { mockProducts } from '@/data/mockProducts';

export function mapBackendProductToFrontend(beProd: any): Product {
  const thumbnail = beProd.thumbnail?.url || (beProd.images && beProd.images[0]?.url) || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600';
  const firstVariant = beProd.variants && beProd.variants[0];
  const price = firstVariant ? Number(firstVariant.price || 180000) : 180000;

  return {
    id: beProd.id || beProd._id,
    name: beProd.name,
    slug: beProd.slug,
    description: beProd.description || '',
    price: price,
    originalPrice: Math.round(price * 1.25),
    discountPercent: 20,
    rating: Number(beProd.ratingAvg || 5.0),
    reviewCount: Number(beProd.ratingCount || 28),
    images: [thumbnail],
    category: beProd.brand || 'Cacao & Socola',
    isNew: beProd.isNew ?? true,
    isFeatured: beProd.isFeatured ?? true,
    isBestSeller: beProd.isBestSeller ?? false,
    inStock: true,
  };
}

/**
 * Lấy danh sách sản phẩm ở Server Component với caching 60s
 */
export async function getProductsServer(category?: string): Promise<Product[]> {
  try {
    const query = category ? `?category=${category}&size=50` : '?size=50';
    const res = await serverFetch<any>(`/v1/storefront/products${query}`, {
      revalidate: 60,
      tags: ['products'],
    });

    if (res.data) {
      const items = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      if (items.length > 0) {
        return items.map(mapBackendProductToFrontend);
      }
    }
  } catch (err) {
    console.warn('[Products] Backend fetch failed, falling back to mockProducts', err);
  }

  return mockProducts;
}

/**
 * Lấy chi tiết sản phẩm theo Slug ở Server Component
 */
export async function getProductBySlugServer(slug: string): Promise<Product | null> {
  try {
    const res = await serverFetch<any>(`/v1/storefront/products?slug=${slug}`, {
      revalidate: 300,
      tags: [`product-${slug}`],
    });

    if (res.data) {
      const items = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      if (items.length > 0) {
        return mapBackendProductToFrontend(items[0]);
      }
    }
  } catch (err) {
    console.warn(`[ProductDetail] Backend fetch failed for slug ${slug}`, err);
  }

  return mockProducts.find(p => p.slug === slug) || null;
}
