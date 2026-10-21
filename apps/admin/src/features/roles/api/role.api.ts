import { Role, Permission, RoleRequest, PermissionRequest, RoleAccess } from '../types/role.interface';
import { clientFetch } from '@/lib/clientFetch';
import { ApiError, ErrorMessages } from '@/constants/errorMessages';

interface ApiRole extends Omit<Role, 'isSystem'> {
  system?: boolean;
  isSystem?: boolean;
}

const normalizeRole = (role: ApiRole): Role => ({
  ...role,
  isSystem: role.isSystem ?? role.system ?? false,
  permissions: role.permissions ?? [],
});

export const roleApi = {
  getAccess: async (): Promise<RoleAccess> => {
    const response = await clientFetch('v1/roles/access', { skipToast: true });
    if (!response.ok) { throw new ApiError('AUTH_ACCESS_DENIED', 'Không thể kiểm tra quyền truy cập.', response.status); }
    const result: { data: RoleAccess } = await response.json();
    return result.data;
  },
  updatePermission: async (id: string, data: PermissionRequest): Promise<Permission> => {
    const response = await clientFetch(`v1/permissions/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), skipToast: true });
    const result = await response.json();
    if (!response.ok) { throw new ApiError(result.code, result.message || 'Không thể cập nhật quyền.', response.status); }
    return result.data;
  },
  deletePermission: async (id: string): Promise<void> => {
    const response = await clientFetch(`v1/permissions/${encodeURIComponent(id)}`, { method: 'DELETE', skipToast: true });
    if (!response.ok) { const result = await response.json(); throw new ApiError(result.code, result.message || 'Không thể xoá quyền.', response.status); }
  },
  // Lấy tất cả vai trò trong hệ thống kèm quyền hạn
  getAll: async (): Promise<Role[]> => {
    const res = await clientFetch('v1/roles');
    if (!res.ok) {
      if (res.status === 403) {
        throw new ApiError('AUTH_ACCESS_DENIED', 'Không có quyền xem vai trò hệ thống', 403);
      }
      throw new Error('Lỗi tải danh sách vai trò hệ thống');
    }
    const result = await res.json();
    return (result.data ?? []).map((role: ApiRole) => normalizeRole(role));
  },

  // Lấy tất cả quyền hạn có sẵn trong hệ thống
  getAllPermissions: async (): Promise<Permission[]> => {
    const res = await clientFetch('v1/roles/permissions');
    if (!res.ok) {
      throw new ApiError(res.status === 403 ? 'AUTH_ACCESS_DENIED' : 'PERMISSION_LIST_FAILED', 'Không thể tải danh sách quyền hạn hệ thống', res.status);
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
      throw new ApiError(errJson.code, errJson.message || ErrorMessages.ROLE_CREATE_PERMISSION_FAILED, res.status, errJson);

    }
    const result = await res.json();
    return result.data as Permission;
  },

  // Lấy chi tiết 1 vai trò theo mã vai trò hoặc ID
  getByCode: async (codeOrId: string): Promise<Role> => {
    const res = await clientFetch(`v1/roles/${codeOrId}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || ErrorMessages.ROLE_NOT_FOUND_FALLBACK, res.status, errJson);

    }
    const result = await res.json();
    return normalizeRole(result.data);
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
      throw new ApiError(errJson.code, errJson.message || ErrorMessages.ROLE_CREATE_FAILED, res.status, errJson);

    }
    const result = await res.json();
    return normalizeRole(result.data);
  },

  // Cập nhật vai trò và ma trận phân quyền
  update: async (id: string, data: RoleRequest): Promise<Role> => {
    const res = await clientFetch(`v1/roles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || ErrorMessages.ROLE_UPDATE_FAILED, res.status, errJson);

    }
    const result = await res.json();
    return normalizeRole(result.data);
  },

  // Xóa vai trò tùy chỉnh
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/roles/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || ErrorMessages.ROLE_DELETE_FAILED, res.status, errJson);

    }
    return { success: true };
  },
};

