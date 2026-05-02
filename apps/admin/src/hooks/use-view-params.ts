'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useViewParams(defaultSort = 'name,asc') {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const page = Number(searchParams.get('page')) || 0;
  const size = Number(searchParams.get('size')) || 10;
  const sort = searchParams.get('sort') || defaultSort;
  const name = searchParams.get('name') || '';

  const createQueryString = useCallback(
    (params: Record<string, string | number | boolean | undefined | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === '' || value === undefined || value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      return newSearchParams.toString();
    },
    [searchParams],
  );

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | boolean | undefined | null>) => {
      router.push(`${pathname}?${createQueryString(newParams)}`, {
        scroll: false,
      });
    },
    [pathname, router, createQueryString],
  );

  const setPage = (newPage: number) => updateUrl({ page: newPage });
  const setSize = (newSize: number) => updateUrl({ page: 0, size: newSize });
  const setSort = (newSort: string) => updateUrl({ page: 0, sort: newSort });

  return {
    page,
    size,
    sort,
    name,
    searchParams,
    updateUrl,
    setPage,
    setSize,
    setSort,
  };
}

export function useDebounceSearch(initialValue: string, onSearch: (val: string) => void, delay = 500) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [searchTerm, initialValue, onSearch, delay]);

  return [searchTerm, setSearchTerm] as const;
}
