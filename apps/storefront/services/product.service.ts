import { serverFetch } from './server-fetch';
import { axiosClient, uploadFileClient } from '@/lib/axios-client';
import { Product } from '@/types/product';

/**
 * PRODUCT SERVICE
 * 🟢 Server Methods: Dùng serverFetch cho Server Components / API Routes (Caching, ISR, revalidate)
 * 🔵 Client Methods: Dùng axiosClient / uploadFileClient cho Client Components (Interactive, Upload, Form)
 */

// ==================== 🟢 SERVER METHODS (Native fetch) ====================

/**
 * Lấy danh sách sản phẩm ở Server Component với caching 60s
 */
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

// ==================== 🔵 CLIENT METHODS (Axios Client) ====================

/**
 * Tạo sản phẩm mới (dùng Axios Client từ Form Submit)
 */
export async function createProductClient(productData: Partial<Product>) {
  return axiosClient.post<any, Product>('/products', productData);
}

/**
 * Upload hình ảnh sản phẩm mới (dùng Axios với Upload Progress)
 */
export async function uploadProductImageClient(
  file: File,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('image', file);

  return uploadFileClient<{ url: string }>('/products/upload', formData, onProgress);
}
