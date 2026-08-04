import { serverFetch } from './server-fetch';
import { Category } from '@/types/product';
import { Cookie, Coffee, Utensils, Flame, Sparkles } from 'lucide-react';

const ICON_LIST = [Cookie, Coffee, Utensils, Flame, Sparkles];

export async function getCategoriesServer(): Promise<Category[]> {
  try {
    const res = await serverFetch<any>('/v1/storefront/categories?size=100', {
      revalidate: 60,
      tags: ['categories'],
    });

    if (res.data) {
      const items = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      if (items.length > 0) {
        return items.map((cat: any, idx: number) => ({
          id: cat.id || `cat-${idx}`,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          icon: ICON_LIST[idx % ICON_LIST.length],
          image: cat.image || '',
          isFeatured: cat.isFeatured ?? true,
          itemCount: cat.productCount || 10,
        }));
      }
    }
  } catch (err) {
    console.warn('[Categories] Backend fetch failed, fallback to mock categories', err);
  }

  // Fallback
  return [
    { id: '1', name: 'Bột Cacao Nguyên Chất', slug: 'bot-cacao-nguyen-chat', icon: Cookie as any, itemCount: 15, isFeatured: true },
    { id: '2', name: 'Cacao Sữa & Hòa Tan', slug: 'cacao-sua-hoa-tan', icon: Coffee as any, itemCount: 20, isFeatured: true },
    { id: '3', name: 'Socola Thanh Craft', slug: 'socola-thanh-craft', icon: Utensils as any, itemCount: 12, isFeatured: true },
    { id: '4', name: 'Nguyên Liệu Pha Chế', slug: 'nguyen-lieu-pha-che', icon: Flame as any, itemCount: 8, isFeatured: true },
  ];
}
