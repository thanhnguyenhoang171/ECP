import { clientFetch } from '@/lib/clientFetch';
import { clientDb, ClientWarehouse } from '@/lib/clientDb';
import { useAuthStore } from '@/store/authStore';

export const warehouseApi = {
  // Lấy danh sách tất cả kho bãi
  getAll: async (): Promise<ClientWarehouse[]> => {
    try {
      const user = useAuthStore.getState().user;
      const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.role === 'SUPER_ADMIN';
      const endpoint = isSuperAdmin ? 'v1/warehouses/admin' : 'v1/warehouses';
      const res = await clientFetch(endpoint);
      if (res.ok) {
        const result = await res.json();
        let items = [];
        if (Array.isArray(result.data)) {
          items = result.data;
        } else if (result.data && Array.isArray(result.data.data)) {
          items = result.data.data;
        } else if (Array.isArray(result)) {
          items = result;
        }

        return items.map((item: any) => ({
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive ?? true)
        }));
      }
    } catch (e) {
      console.warn('Backend getAll warehouses failed, using mock fallback', e);
    }

    // Fallback về mock data
    return clientDb.getWarehouses();
  },

  // Lấy chi tiết kho bãi
  getById: async (id: string): Promise<ClientWarehouse | null> => {
    try {
      const user = useAuthStore.getState().user;
      const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || user?.role === 'SUPER_ADMIN';
      const endpoint = isSuperAdmin ? `v1/warehouses/admin/${id}` : `v1/warehouses/${id}`;
      const res = await clientFetch(endpoint);
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive ?? true)
        };
      }
    } catch (e) {
      console.warn('Backend getById warehouse failed, using mock fallback', e);
    }
    const data = clientDb.getWarehouses().find(w => w.id === id);
    return data || null;
  },

  // Tạo mới kho bãi
  create: async (data: any): Promise<ClientWarehouse> => {
    try {
      const payload = { ...data, active: data.isActive };
      delete payload.isActive;

      const res = await clientFetch(`v1/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive ?? true)
        };
      }
    } catch (e) {
      console.warn('Backend create warehouse failed, using mock fallback', e);
    }

    return clientDb.saveWarehouse(data);
  },

  // Chỉnh sửa kho bãi
  update: async (id: string, data: any): Promise<ClientWarehouse> => {
    try {
      const payload = { ...data, active: data.isActive };
      delete payload.isActive;

      const res = await clientFetch(`v1/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive ?? true)
        };
      }
    } catch (e) {
      console.warn('Backend update warehouse failed, using mock fallback', e);
    }

    return clientDb.saveWarehouse({ ...data, id });
  },

  // Xóa kho bãi
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await clientFetch(`v1/warehouses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        clientDb.deleteWarehouse(id);
        return { success: true };
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || 'Không thể xóa kho bãi';
        throw new Error(msg);
      }
    } catch (e: any) {
      if (e?.message && e.message !== 'Failed to fetch') {
        throw e;
      }
      console.warn('Backend delete warehouse failed, using mock fallback', e);
    }

    const success = clientDb.deleteWarehouse(id);
    if (!success) throw new Error('Không thể xóa kho bãi');
    return { success: true };
  },
};
