import { warehouseList, warehouseRequest } from '@/features/inventory/api/warehouse-request';
import type { ClientSupplier } from '@/features/inventory/types/inventory.types';
import type { SupplierFormValues } from '@/features/inventory/schemas/supplier.schema';

type ApiSupplier = ClientSupplier & { active?: boolean };
const normalize = (item: ApiSupplier): ClientSupplier => ({ ...item, isActive: item.isActive ?? item.active ?? false });

export const supplierApi = {
  getAll: async (): Promise<ClientSupplier[]> => (await warehouseList<ApiSupplier>('v1/suppliers')).map(normalize),
  getById: async (id: string): Promise<ClientSupplier> => normalize(await warehouseRequest<ApiSupplier>(`v1/suppliers/${id}`)),
  create: async (data: SupplierFormValues): Promise<ClientSupplier> => normalize(await warehouseRequest<ApiSupplier>('v1/suppliers', 'POST', data)),
  update: async (id: string, data: SupplierFormValues): Promise<ClientSupplier> => normalize(await warehouseRequest<ApiSupplier>(`v1/suppliers/${id}`, 'PATCH', data)),
  delete: async (id: string): Promise<{ success: boolean }> => {
    await warehouseRequest<null>(`v1/suppliers/${id}`, 'DELETE');
    return { success: true };
  },
};
