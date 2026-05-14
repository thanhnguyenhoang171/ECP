export interface SortOption {
  label: string;
  value: string;
}

export const COMMON_SORT_OPTIONS: Record<string, SortOption[]> = {
  NAME: [
    { label: 'Tên (A-Z)', value: 'name,asc' },
    { label: 'Tên (Z-A)', value: 'name,desc' },
  ],
  SKU: [
    { label: 'Mã SKU (A-Z)', value: 'sku,asc' },
    { label: 'Mã SKU (Z-A)', value: 'sku,desc' },
  ],
  DATE: [
    { label: 'Mới nhất', value: 'createdAt,desc' },
    { label: 'Cũ nhất', value: 'createdAt,asc' },
  ],
  PRICE: [
    { label: 'Giá (Thấp đến Cao)', value: 'price,asc' },
    { label: 'Giá (Cao đến Thấp)', value: 'price,desc' },
  ],
};

/**
 * Combines common sort options
 * @param keys Array of keys from COMMON_SORT_OPTIONS
 * @returns Array of SortOption
 */
export const getSortOptions = (keys: (keyof typeof COMMON_SORT_OPTIONS)[]): SortOption[] => {
  return keys.flatMap(key => COMMON_SORT_OPTIONS[key]);
};
