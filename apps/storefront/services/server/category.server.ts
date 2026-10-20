import { serverFetch } from './server-fetch';
import { CatalogPage, Category } from '@/types/product';

interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  image?: string | { url?: string };
  isFeatured?: boolean;
  sortOrder?: number;
}

export async function getCategoriesServer(): Promise<Category[]> {
  const categories: Category[] = [];
  let page = 0;
  let hasMore = true;
  while (hasMore) {
    const result = await serverFetch<CatalogPage<BackendCategory>>(`/v1/storefront/categories?active=true&size=100&page=${page}`, { revalidate: 0 });
    if (result.error || !result.data?.success || !Array.isArray(result.data.data)) {
      throw new Error('Không thể tải danh mục sản phẩm. Vui lòng thử lại.');
    }
    categories.push(...result.data.data.filter((category) => category.active).map((category) => ({
      id: category.id, name: category.name, slug: category.slug, description: category.description,
      image: typeof category.image === 'string' ? category.image : category.image?.url,
      isFeatured: category.isFeatured ?? false, itemCount: 0, sortOrder: category.sortOrder ?? 0,
    })));
    hasMore = Boolean(result.data.pagination && !result.data.pagination.last && page + 1 < result.data.pagination.totalPages);
    page += 1;
  }
  return categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
