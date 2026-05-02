import CategoriesView from '@/features/categories/components/CategoriesView';
import { PageResponse } from '@/types/pagination';
import { Category } from '@/features/categories/types/category.interface';

// Hàm fetch dữ liệu tại Server với Caching
async function getCategories(
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<Category>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/categories?page=${page}&size=${size}&sort=${sort}`,
      {
        next: {
          revalidate: 3600, // Cache 1 giờ
          tags: ['categories-list'], // Tag để xóa cache chủ động
        },
      },
    );

    if (!res.ok) throw new Error('Failed to fetch categories');

    const result = await res.json();
    console.log('Checking get categories result at SERVER:', result);

    return result;
  } catch (error) {
    console.error('Server fetch categories error:', error);
    return {
      success: false,
      message: 'Error fetching data from server',
      data: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: size,
        last: true,
        first: true,
      },
    };
  }
}

async function getParentCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/categories/parents`,
      {
        next: {
          revalidate: 3600,
          tags: ['categories-parents'],
        },
      },
    );
    if (!res.ok) return [];
    const result = await res.json();
    console.log('Checking get parent categories result at SERVER:', result);
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Server fetch parent categories error:', error);
    return [];
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 0;
  const size = Number(params.size) || 10;
  const sort = (params.sort as string) || 'name,asc';

  const [categoriesResponse, parentCategories] = await Promise.all([
    getCategories(page, size, sort),
    getParentCategories(),
  ]);

  return (
    <CategoriesView
      initialData={categoriesResponse}
      parentCategories={parentCategories}
    />
  );
}
