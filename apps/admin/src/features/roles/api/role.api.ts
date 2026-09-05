import { Role, Permission, RoleRequest, PermissionRequest } from '../types/role.interface';
import { clientFetch } from '@/lib/clientFetch';

export const roleApi = {
  // Lấy tất cả vai trò trong hệ thống kèm quyền hạn
  getAll: async (): Promise<Role[]> => {
    const res = await clientFetch('v1/roles');
    if (!res.ok) {
      throw new Error('Lỗi tải danh sách vai trò hệ thống');
    }
    const result = await res.json();
    return (result.data || []) as Role[];
  },

  // Lấy tất cả quyền hạn có sẵn trong hệ thống
  getAllPermissions: async (): Promise<Permission[]> => {
    const res = await clientFetch('v1/roles/permissions');
    if (!res.ok) {
      throw new Error('Lỗi tải danh sách quyền hạn hệ thống');
    }
    const result = await res.json();
    return (result.data || []) as Permission[];
  },

  // Tạo quyền hạn mới trong hệ thống
  createPermission: async (data: PermissionRequest): Promise<Permission> => {
    const res = await clientFetch('v1/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Tạo quyền hạn mới thất bại');
    }
    const result = await res.json();
    return result.data as Permission;
  },

  // Lấy chi tiết 1 vai trò theo mã vai trò hoặc ID
  getByCode: async (codeOrId: string): Promise<Role> => {
    const res = await clientFetch(`v1/roles/${codeOrId}`);
    if (!res.ok) {
      throw new Error('Không tìm thấy vai trò');
    }
    const result = await res.json();
    return result.data as Role;
  },

  // Tạo vai trò tùy chỉnh mới
  create: async (data: RoleRequest): Promise<Role> => {
    const res = await clientFetch('v1/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Tạo vai trò thất bại');
    }
    const result = await res.json();
    return result.data as Role;
  },

  // Cập nhật vai trò và ma trận phân quyền
  update: async (id: string, data: RoleRequest): Promise<Role> => {
    const res = await clientFetch(`v1/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Cập nhật vai trò thất bại');
    }
    const result = await res.json();
    return result.data as Role;
  },

  // Xóa vai trò tùy chỉnh
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/roles/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Xóa vai trò thất bại');
    }
    return { success: true };
  },
};

