import { warehouseList, warehouseRequest } from '@/features/inventory/api/warehouse-request';
import type { ClientWarehouse } from '@/features/inventory/types/inventory.types';
import type { WarehouseFormValues } from '@/features/warehouses/schemas/warehouse.schema';

type ApiWarehouse = ClientWarehouse & { active?: boolean };
const normalize = (item: ApiWarehouse): ClientWarehouse => ({ ...item, isActive: item.isActive ?? item.active ?? false });

export const warehouseApi = {
  getAll: async (): Promise<ClientWarehouse[]> => (await warehouseList<ApiWarehouse>('v1/warehouses')).map(normalize),
  getById: async (id: string): Promise<ClientWarehouse> => normalize(await warehouseRequest<ApiWarehouse>(`v1/warehouses/${id}`)),
  create: async (data: WarehouseFormValues): Promise<ClientWarehouse> => normalize(await warehouseRequest<ApiWarehouse>('v1/warehouses', 'POST', data)),
  update: async (id: string, data: WarehouseFormValues): Promise<ClientWarehouse> => normalize(await warehouseRequest<ApiWarehouse>(`v1/warehouses/${id}`, 'PATCH', data)),
  delete: async (id: string): Promise<{ success: boolean }> => {
    await warehouseRequest<null>(`v1/warehouses/${id}`, 'DELETE');
    return { success: true };
  },
};
