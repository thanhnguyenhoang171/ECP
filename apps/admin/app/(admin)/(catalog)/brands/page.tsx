import BrandsView from '@/features/brands/components/BrandsView';
import { PageResponse } from '@/types/pagination';
import { Brand } from '@/features/brands/types/brand.interface';
import { serverFetch } from '@/lib/serverFetch';
import { toApiPage, syncPagination } from '@/lib/utils';

async function getBrands(
  page: number, 
  size: number, 
  sort: string, 
  name?: string, 
  active?: string
): Promise<PageResponse<Brand>> {
  try {
    const apiPage = toApiPage(page);
    const query = new URLSearchParams();
    query.append('page', apiPage.toString());
    query.append('size', size.toString());
    if (sort) query.append('sort', sort);
    if (name) query.append('name', name);
    if (active !== undefined && active !== '') query.append('active', active);

    const res = await serverFetch(`v1/brands?${query.toString()}`, {
      cache: 'no-store',
      next: { tags: ['brands-list'] },
    } as any);

    if (!res.ok) throw new Error('Failed to fetch brands');
    const result: PageResponse<Brand> = await res.json();
    return syncPagination<PageResponse<Brand>>(result);
  } catch (error) {
    console.error('Server fetch brands error:', error);
    return {
      success: false,
      message: 'Error fetching data from server',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalElements: 0,
        pageSize: size,
        last: true,
        first: true,
      },
    };
  }
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;
  const sort = (params.sort as string) || 'name,asc';
  const name = params.name as string | undefined;
  const active = params.active as string | undefined;

  const brandsResponse = await getBrands(page, size, sort, name, active);

  return <BrandsView initialData={brandsResponse} />;
}

