import { User } from '../types/user.interface';
import { PageResponse, PaginationInfo } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage } from '@/lib/utils';

export interface BackendUserResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
  active?: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export const mapBackendUserToFrontend = (b: BackendUserResponse): User => {
  const isAct = b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true);
  const avatar = b.avatarUrl || (b as any).avatar_url || (b as any).avatar || undefined;

  return {
    id: b.id,
    fullName: [b.firstName, b.lastName].filter(Boolean).join(' ').trim() || b.email,
    email: b.email,
    phone: b.phoneNumber || '',
    role: b.role,
    status: isAct ? 'active' : 'inactive',
    isOnline: false,
    lastActive: 'Không rõ',
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
      throw new Error(errJson.message || 'Tạo người dùng thất bại');
    }

    const result = await res.json();
    return mapBackendUserToFrontend(result.data);
  },

  // Chỉnh sửa nhân viên / người dùng (Hỗ trợ Partial Update)
  update: async (id: string, data: any): Promise<User> => {
    const payload: Record<string, any> = {};

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

    if (data.role !== undefined) payload.role = data.role;
    if (data.active !== undefined) payload.active = data.active;
    else if (data.status !== undefined) payload.active = data.status === 'active';

    if (data.avatarUrl !== undefined && data.avatarUrl !== '') payload.avatarUrl = data.avatarUrl;
    if (data.avatarPublicId !== undefined && data.avatarPublicId !== '') payload.avatarPublicId = data.avatarPublicId;

    const res = await clientFetch(`v1/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Cập nhật người dùng thất bại');
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
      throw new Error('Xóa người dùng thất bại');
    }
    return { success: true };
  },

  // Lấy thống kê số lượng người dùng (MySQL + Redis)
  getStatistics: async (): Promise<UserStatistics> => {
    const res = await clientFetch('v1/users/statistics');
    if (!res.ok) {
      return { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0, customerUsers: 0 };
    }
    const result = await res.json();
    if (result.success && result.data) {
      const stats = result.data;
      return {
        totalUsers: stats.totalUsers || 0,
        onlineUsers: stats.onlineUsers || 0,
        offlineUsers: stats.offlineUsers || 0,
        managementUsers: stats.managementUsers || 0,
        customerUsers: stats.customerUsers !== undefined ? stats.customerUsers : ((stats.totalUsers || 0) - (stats.managementUsers || 0)),
      };
    }
    return { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0, customerUsers: 0 };
  },
};

export interface UserStatistics {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  managementUsers: number;
  customerUsers: number;
}
