import { clientFetch } from '@/lib/clientFetch';
import { clientDb, ClientSupplier } from '@/lib/clientDb';

export const supplierApi = {
  // Lấy danh sách tất cả nhà cung cấp
  getAll: async (): Promise<ClientSupplier[]> => {
    try {
      const res = await clientFetch(`v1/suppliers`);
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
          isActive: item.active !== undefined ? item.active : (item.isActive || false)
        }));
      }
    } catch (e) {
      console.warn('Backend getAll suppliers failed, using mock fallback', e);
    }

    // Fallback về mock data
    return clientDb.getSuppliers();
  },

  // Lấy chi tiết nhà cung cấp
  getById: async (id: string): Promise<ClientSupplier | null> => {
    try {
      const res = await clientFetch(`v1/suppliers/${id}`);
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive || false)
        };
      }
    } catch (e) {
      console.warn('Backend getById supplier failed, using mock fallback', e);
    }
    const data = clientDb.getSuppliers().find(s => s.id === id);
    return data || null;
  },

  // Tạo mới nhà cung cấp
  create: async (data: any): Promise<ClientSupplier> => {
    try {
      // API expects 'active' instead of 'isActive'
      const payload = { ...data, active: data.isActive };
      delete payload.isActive;
      
      const res = await clientFetch(`v1/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive || false)
        };
      }
    } catch (e) {
      console.warn('Backend create supplier failed, using mock fallback', e);
    }
    
    return clientDb.saveSupplier(data);
  },

  // Chỉnh sửa nhà cung cấp
  update: async (id: string, data: any): Promise<ClientSupplier> => {
    try {
      const payload = { ...data, active: data.isActive };
      delete payload.isActive;

      const res = await clientFetch(`v1/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        const item = result.data || result;
        return {
          ...item,
          isActive: item.active !== undefined ? item.active : (item.isActive || false)
        };
      }
    } catch (e) {
      console.warn('Backend update supplier failed, using mock fallback', e);
    }

    return clientDb.saveSupplier({ ...data, id });
  },

  // Xóa nhà cung cấp
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await clientFetch(`v1/suppliers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        clientDb.deleteSupplier(id); // Giữ đồng bộ mock data nếu ứng dụng load lại từ mock
        return { success: true };
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || 'Không thể xóa nhà cung cấp';
        throw new Error(msg);
      }
    } catch (e: any) {
      if (e?.message && e.message !== 'Failed to fetch') {
        throw e;
      }
      console.warn('Backend delete supplier failed, using mock fallback', e);
    }
    
    // Fallback logic khi không có kết nối backend
    const success = clientDb.deleteSupplier(id);
    if (!success) throw new Error('Không thể xóa nhà cung cấp');
    return { success: true };
  },
};
