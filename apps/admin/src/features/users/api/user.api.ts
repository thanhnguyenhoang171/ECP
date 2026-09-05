import { User } from '../types/user.interface';
import { PageResponse, PaginationInfo } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage } from '@/lib/utils';
import { ApiError } from '@/constants/errorMessages';

export interface BackendUserResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
  active?: boolean;
  isOnline?: boolean;
  lastLoginAt?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const normalizeRole = (b: unknown): User['role'] => {
  const item = b as Record<string, unknown>;
  let rawRole: string = '';

  if (typeof item?.role === 'string' && item.role) {
    rawRole = item.role;
  } else if (item?.role && typeof item.role === 'object' && 'name' in (item.role as Record<string, unknown>)) {
    rawRole = String((item.role as { name?: string }).name || '');
  } else if (Array.isArray(item?.roles) && item.roles.length > 0) {
    const firstRole = item.roles[0];
    if (typeof firstRole === 'string') {
      rawRole = firstRole;
    } else if (firstRole && typeof firstRole === 'object') {
      rawRole = String(firstRole.name || firstRole.role || firstRole.authority || '');
    }
  } else if (Array.isArray(item?.authorities) && item.authorities.length > 0) {
    const firstAuth = item.authorities[0];
    if (typeof firstAuth === 'string') {
      rawRole = firstAuth;
    } else if (firstAuth && typeof firstAuth === 'object') {
      rawRole = String(firstAuth.authority || firstAuth.role || '');
    }
  }

  const cleanRole = rawRole.toUpperCase().replace(/^ROLE_/, '').trim();

  if (cleanRole === 'SUPER_ADMIN' || cleanRole === 'ADMIN') return 'SUPER_ADMIN';
  if (cleanRole === 'MANAGER' || cleanRole === 'STAFF' || cleanRole === 'ADMINISTRATOR') return 'MANAGER';
  return 'USER';
};

export const normalizeOnlineStatus = (b: unknown): boolean => {
  const item = b as Record<string, unknown>;
  if (typeof item?.isOnline === 'boolean') return item.isOnline;
  if (typeof item?.online === 'boolean') return item.online;
  if (typeof item?.is_online === 'boolean') return item.is_online;

  const statusStr = String(item?.sessionStatus || item?.onlineStatus || item?.userStatus || '').toUpperCase();
  if (statusStr === 'ONLINE' || statusStr === 'ACTIVE_SESSION') return true;

  return false;
};

export const normalizeLastActive = (b: unknown): string => {
  const item = b as Record<string, unknown>;
  const val = (item?.lastActive || item?.lastActiveAt || item?.lastLoginAt || item?.last_login_at || item?.updatedAt) as string | undefined;
  if (!val) return 'Không rõ';
  if (typeof val === 'string' && val.includes('T')) {
    return val.split('T')[0];
  }
  return String(val);
};

export const mapBackendUserToFrontend = (b: BackendUserResponse): User => {
  const isAct = b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true);
  const rawObj = b as unknown as Record<string, unknown>;
  const avatar = b.avatarUrl || (typeof rawObj.avatar_url === 'string' ? rawObj.avatar_url : undefined) || (typeof rawObj.avatar === 'string' ? rawObj.avatar : undefined);
  const userRole = normalizeRole(b);
  const onlineStatus = normalizeOnlineStatus(b);
  const lastActiveStatus = normalizeLastActive(b);

  return {
    id: b.id,
    fullName: [b.firstName, b.lastName].filter(Boolean).join(' ').trim() || b.email,
    email: b.email,
    phone: b.phoneNumber || '',
    role: userRole,
    status: isAct ? 'active' : 'inactive',
    isOnline: onlineStatus,
    lastActive: lastActiveStatus,
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '',
    firstName: b.firstName,
    lastName: b.lastName,
    avatarUrl: avatar,
    avatarPublicId: b.avatarPublicId,
    updatedAt: b.updatedAt,
    createdBy: b.createdBy || '',
    updatedBy: b.updatedBy || '',
  };
};

export const userApi = {
  // Lấy danh sách phân trang (kết nối Backend API /v1/users)
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    keyword?: string;
    role?: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
    roles?: string[] | string;
    active?: boolean;
  }): Promise<PageResponse<User>> => {
    const apiPage = toApiPage(params.page);
    const queryParams = new URLSearchParams();
    queryParams.append('page', apiPage.toString());
    queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.keyword) queryParams.append('keyword', params.keyword);

    if (params.roles) {
      const rolesList = Array.isArray(params.roles) ? params.roles : params.roles.split(',');
      rolesList.forEach(r => queryParams.append('roles', r.trim()));
    } else if (params.role) {
      queryParams.append('roles', params.role);
    }

    if (params.active !== undefined) queryParams.append('active', params.active.toString());

    const res = await clientFetch(`v1/users?${queryParams.toString()}`);
    if (!res.ok) {
      throw new Error('Lỗi tải danh sách người dùng');
    }

    const result = await res.json();
    const items = (result.data || []).map(mapBackendUserToFrontend);
    const bePg = result.pagination || {};
    const pg: PaginationInfo = {
      currentPage: bePg.currentPage || params.page,
      totalPages: bePg.totalPages || 1,
      totalElements: bePg.totalElements || items.length,
      pageSize: bePg.pageSize || params.size,
      first: bePg.first ?? bePg.isFirst ?? (params.page === 1),
      last: bePg.last ?? bePg.isLast ?? (params.page >= (bePg.totalPages || 1)),
    };

    return {
      success: true,
      message: result.message || 'Lấy danh sách người dùng thành công',
      data: items,
      pagination: pg,
    };
  },

  // Lấy thông tin chi tiết 1 người dùng theo ID
  getById: async (id: string): Promise<User> => {
    const res = await clientFetch(`v1/users/${id}`);
    if (!res.ok) {
      throw new Error('Không tìm thấy người dùng');
    }
    const result = await res.json();
    return mapBackendUserToFrontend(result.data);
  },

  // Tạo mới nhân viên / người dùng (Gửi đến /api/users/create với phân quyền & audit log)
  create: async (data: any): Promise<User> => {
    const names = (data.fullName || '').trim().split(' ');
    const lastName = names.length > 1 ? names[names.length - 1] : '';
    const firstName = names.length > 1 ? names.slice(0, names.length - 1).join(' ') : (data.fullName || '');

    const payload = {
      email: data.email,
      firstName: data.firstName || firstName,
      lastName: data.lastName || lastName,
      phoneNumber: data.phoneNumber || data.phone,
      role: data.role || 'USER',
      active: data.active !== undefined ? data.active : (data.status === 'active'),
      avatarUrl: data.avatarUrl || '',
      avatarPublicId: data.avatarPublicId || '',
      password: data.password || '',
    };

    const res = await clientFetch(`/api/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Tạo người dùng thất bại', res.status, errJson);
    }

    const result = await res.json();
    return mapBackendUserToFrontend(result.data);
  },

  // Chỉnh sửa nhân viên / người dùng (Hỗ trợ Partial Update & Avatar File Upload)
  update: async (id: string, data: any): Promise<User> => {
    const payload: Record<string, any> = {};

    let avatarFile: File | undefined = undefined;
    if (data.avatarFile instanceof File) {
      avatarFile = data.avatarFile;
    } else if (data.avatarUrl instanceof File) {
      avatarFile = data.avatarUrl;
    }

    if (data.email !== undefined && data.email !== '') payload.email = data.email;

    if (data.fullName !== undefined) {
      const names = (data.fullName || '').trim().split(' ');
      const lastName = names.length > 1 ? names[names.length - 1] : '';
      const firstName = names.length > 1 ? names.slice(0, names.length - 1).join(' ') : data.fullName;
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
    }
    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;

    if (data.phoneNumber !== undefined || data.phone !== undefined) {
      payload.phoneNumber = data.phoneNumber !== undefined ? data.phoneNumber : data.phone;
    }

    if (data.roles !== undefined) {
      payload.roles = Array.isArray(data.roles) ? data.roles : [data.roles];
    } else if (data.role !== undefined) {
      payload.roles = [data.role];
      payload.role = data.role;
    }
    if (data.active !== undefined) payload.active = data.active;
    else if (data.status !== undefined) payload.active = data.status === 'active';

    if (typeof data.avatarUrl === 'string' && data.avatarUrl !== '') payload.avatarUrl = data.avatarUrl;
    if (data.avatarPublicId !== undefined && data.avatarPublicId !== '') payload.avatarPublicId = data.avatarPublicId;

    let res: Response;
    if (avatarFile) {
      const formData = new FormData();
      formData.append('user', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      formData.append('avatarFile', avatarFile);

      res = await clientFetch(`v1/users/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      res = await clientFetch(`v1/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Cập nhật người dùng thất bại', res.status, errJson);
    }

    const result = await res.json();
    return mapBackendUserToFrontend(result.data);
  },

  // Xóa/Ngừng hoạt động người dùng
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new ApiError(errJson.code, errJson.message || 'Xóa người dùng thất bại', res.status, errJson);
    }
    return { success: true };
  },

  // Lấy thống kê số lượng người dùng (MySQL + Redis)
  getStatistics: async (): Promise<UserStatistics> => {
    const defaultStats: UserStatistics = {
      totalUsers: 0,
      onlineUsers: 0,
      offlineUsers: 0,
      managementUsers: 0,
      customerUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
    };

    const res = await clientFetch('v1/users/statistics');
    if (!res.ok) {
      return defaultStats;
    }
    const result = await res.json();
    if (result.success && result.data) {
      const stats = result.data as Record<string, unknown>;
      const total = Number(stats.totalUsers || stats.total || 0);
      const online = Number(stats.onlineUsers || stats.online || 0);
      const mgmt = Number(stats.managementUsers || stats.management || stats.staffUsers || 0);
      const cust = Number(stats.customerUsers || stats.customers || (total - mgmt > 0 ? total - mgmt : 0));
      const offline = Number(stats.offlineUsers || stats.offline || (total - online > 0 ? total - online : 0));
      const active = Number(stats.activeUsers || stats.active || 0);
      const inactive = Number(stats.inactiveUsers || stats.inactive || stats.lockedUsers || (total - active > 0 ? total - active : 0));
      const superAdmin = stats.superAdminUsers !== undefined ? Number(stats.superAdminUsers) : (stats.superAdmins !== undefined ? Number(stats.superAdmins) : undefined);
      const manager = stats.managerUsers !== undefined ? Number(stats.managerUsers) : (stats.managers !== undefined ? Number(stats.managers) : undefined);

      return {
        totalUsers: total,
        onlineUsers: online,
        offlineUsers: offline,
        managementUsers: mgmt,
        customerUsers: cust,
        activeUsers: active,
        inactiveUsers: inactive,
        superAdminUsers: superAdmin,
        managerUsers: manager,
      };
    }
    return defaultStats;
  },
};

export interface UserStatistics {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  managementUsers: number;
  customerUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  superAdminUsers?: number;
  managerUsers?: number;
}
