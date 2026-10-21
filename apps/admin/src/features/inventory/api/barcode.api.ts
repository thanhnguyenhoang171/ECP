import { clientFetch } from '@/lib/clientFetch';
import { readCatalogResult } from '@/lib/catalog-api';
import type { BarcodeLookup } from '../types/barcode';

export const barcodeApi = {
  lookup: async (code: string, warehouseId?: string, signal?: AbortSignal): Promise<BarcodeLookup> => {
    const query = new URLSearchParams({ code: code.trim() });
    if (warehouseId) { query.set('warehouseId', warehouseId); }
    return (await readCatalogResult<BarcodeLookup>(await clientFetch(`v1/inventory/barcode?${query}`, {
      cache: 'no-store', skipToast: true, signal,
    }), 'Không thể tra cứu mã vạch')).data;
  },
};
