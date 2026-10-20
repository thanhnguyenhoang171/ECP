'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Layers, Loader2, Plus, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { brandApi } from '@/features/brands/api/brand.api';
import { useCreateBrand } from '@/features/brands/hooks/use-brand-mutation';
import { brandSchema } from '@/features/brands/schemas/brand.schema';
import { categoryApi } from '@/features/categories/api/category.api';
import { useCreateCategory } from '@/features/categories/hooks/use-category-mutation';
import { categorySchema } from '@/features/categories/schemas/category.schema';
import { cn } from '@/lib/utils';
import { PageResponse } from '@/types/pagination';

type CatalogKind = 'brands' | 'categories';

interface CatalogOption {
  readonly id: string;
  readonly name: string;
  readonly imageUrl?: string;
}

interface ActiveCatalogSelectProps {
  readonly kind: CatalogKind;
  readonly value?: string;
  readonly onChange: (id: string, name: string) => void;
}

const toOption = (item: { id: string; name: string; logo?: unknown; imageUrl?: unknown }): CatalogOption => {
  const image = item.logo || item.imageUrl;
  return { id: item.id, name: item.name, imageUrl: typeof image === 'string' ? image : undefined };
};

const loadOptions = async (kind: CatalogKind, page: number, name: string): Promise<PageResponse<CatalogOption>> => {
  const result = kind === 'brands'
    ? await brandApi.getActive({ page, size: 10, name })
    : await categoryApi.getActive({ page, size: 10, name });
  return { ...result, data: result.data.map(toOption) };
};

const OptionLabel = ({ option, kind }: { option: CatalogOption; kind: CatalogKind }): React.JSX.Element => (
  <span className='flex min-w-0 items-center gap-2'>
    <span className='flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-0.5'>
      {option.imageUrl ? (
        <Image src={option.imageUrl} alt='' width={28} height={28} className='h-full w-full object-contain' unoptimized />
      ) : kind === 'brands' ? (
        <Tag className='h-3.5 w-3.5 text-slate-400' />
      ) : (
        <Layers className='h-3.5 w-3.5 text-slate-400' />
      )}
    </span>
    <span className='truncate'>{option.name}</span>
  </span>
);

export const ActiveCatalogSelect = ({ kind, value, onChange }: ActiveCatalogSelectProps): React.JSX.Element => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();
  const createBrand = useCreateBrand();
  const createCategory = useCreateCategory();
  const label = kind === 'brands' ? 'thương hiệu' : 'danh mục';
  const isCreating = createBrand.isPending || createCategory.isPending;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const optionsQuery = useInfiniteQuery({
    queryKey: [kind, 'active', 'options', debouncedSearch],
    queryFn: ({ pageParam }) => loadOptions(kind, pageParam, debouncedSearch),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages, last } = lastPage.pagination;
      return !last && currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const options = [...new Map(optionsQuery.data?.pages.flatMap((page) => page.data).map((option) => [option.id, option])).values()];
  const selectedFromOptions = options.find((option) => option.id === value);
  const selectedQuery = useQuery({
    queryKey: [kind, 'selected', value],
    queryFn: async (): Promise<CatalogOption> => {
      if (!value) {
        throw new Error('Chưa chọn mục');
      }
      return toOption(kind === 'brands' ? await brandApi.getById(value) : await categoryApi.getById(value));
    },
    enabled: Boolean(value) && !selectedFromOptions,
    staleTime: 5 * 60 * 1000,
  });
  const selected = selectedFromOptions || selectedQuery.data;
  const isSearching = search.trim() !== debouncedSearch;
  const isExactMatch = options.some((option) => option.name.trim().toLocaleLowerCase('vi') === debouncedSearch.toLocaleLowerCase('vi'));
  const canCreate = Boolean(debouncedSearch) && !isExactMatch && !isSearching && !optionsQuery.isFetching
    && !optionsQuery.isError && !optionsQuery.hasNextPage && optionsQuery.isSuccess;

  const handleCreate = async (): Promise<void> => {
    if (!canCreate || isCreating) {
      return;
    }
    try {
      let option: CatalogOption;
      if (kind === 'brands') {
        const parsed = brandSchema.safeParse({ name: debouncedSearch });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message || 'Tên thương hiệu không hợp lệ');
          return;
        }
        const result = await createBrand.mutateAsync(parsed.data);
        if (!result.success) {
          toast.error('Tạo thương hiệu thất bại');
          return;
        }
        option = toOption(result.data);
      } else {
        const parsed = categorySchema.safeParse({ name: debouncedSearch });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message || 'Tên danh mục không hợp lệ');
          return;
        }
        const result = await createCategory.mutateAsync(parsed.data);
        if (!result.success) {
          toast.error('Tạo danh mục thất bại');
          return;
        }
        option = toOption(result.data);
      }
      queryClient.setQueryData([kind, 'selected', option.id], option);
      onChange(option.id, option.name);
      setOpen(false);
      setSearch('');
    } catch (error) {
      console.error('Quick catalog creation failed:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' role='combobox' aria-expanded={open}
          aria-label={`Chọn ${label}`} className='w-full h-11 justify-between bg-white border-slate-200 text-left font-normal'>
          {selected ? <OptionLabel option={selected} kind={kind} /> : (
            <span className='truncate text-slate-400'>
              {value && selectedQuery.isFetching ? 'Đang tải...' : `Chọn hoặc nhập tên ${label}...`}
            </span>
          )}
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[320px] max-w-[calc(100vw-2rem)] p-2' align='start'>
        <div className='space-y-2'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400' />
            <Input aria-label={`Tìm ${label}`} placeholder='Tìm hoặc nhập tên mới...' value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
              disabled={isCreating} className='pl-8 h-9 text-xs' />
          </div>
          <div className='max-h-64 overflow-y-auto space-y-1 custom-scrollbar'>
            {isSearching || optionsQuery.isPending ? (
              <p className='flex items-center justify-center gap-2 p-3 text-xs text-slate-500'><Loader2 className='h-4 w-4 animate-spin' />Đang tìm...</p>
            ) : (
              options.map((option) => (
                <button key={option.id} type='button' disabled={isCreating}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs rounded-md flex items-center justify-between',
                    option.id === value
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  )}
                  onClick={() => { onChange(option.id, option.name); setOpen(false); setSearch(''); }}>
                  <OptionLabel option={option} kind={kind} />
                  {option.id === value && <Check className='ml-2 h-3.5 w-3.5 shrink-0 text-blue-600' />}
                </button>
              ))
            )}
            {optionsQuery.isError && (
              <div className='p-3 text-center text-xs text-red-600'>
                Không thể tải danh sách.
                <Button type='button' variant='link' size='sm' onClick={() => optionsQuery.isFetchNextPageError ? optionsQuery.fetchNextPage() : optionsQuery.refetch()}>Thử lại</Button>
              </div>
            )}
            {!isSearching && optionsQuery.isSuccess && options.length === 0 && (
              <p className='p-3 text-center text-xs text-slate-400'>Không tìm thấy {label} phù hợp.</p>
            )}
            {!isSearching && optionsQuery.hasNextPage && !optionsQuery.isError && (
              <Button type='button' variant='ghost' size='sm' className='w-full text-xs text-blue-600'
                disabled={optionsQuery.isFetching || isCreating} onClick={() => optionsQuery.fetchNextPage()}>
                {optionsQuery.isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
              </Button>
            )}
            {canCreate && (
              <Button type='button' variant='outline' className='w-full justify-start gap-2 text-xs text-blue-700'
                disabled={isCreating} onClick={handleCreate}>
                <Plus className='h-3.5 w-3.5 shrink-0' />
                <span className='truncate'>{isCreating ? 'Đang tạo...' : `Tạo mới ${label} "${debouncedSearch}"`}</span>
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
