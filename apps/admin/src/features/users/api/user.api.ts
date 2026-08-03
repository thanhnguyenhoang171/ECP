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
}

export const mapBackendUserToFrontend = (b: BackendUserResponse): User => {
  const isAct = b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true);
  return {
    id: b.id,
    fullName: [b.firstName, b.lastName].filter(Boolean).join(' ').trim() || b.email,
    email: b.email,
    phone: b.phoneNumber || '',
    role: b.role,
    status: isAct ? 'active' : 'inactive',
    isOnline: b.id === 'u-1' || b.id === 'u-2',
    lastActive: 'Không rõ',
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '',
    firstName: b.firstName,
    lastName: b.lastName,
    avatarUrl: b.avatarUrl,
    avatarPublicId: b.avatarPublicId,
    updatedAt: b.updatedAt,
  };
};

// Cơ sở dữ liệu in-memory mẫu trên client
let mockUsers: BackendUserResponse[] = [
  {
    id: 'u-1',
    email: 'admin@ecp.com',
    phoneNumber: '0901234567',
    role: 'SUPER_ADMIN',
    active: true,
    firstName: 'Quản trị viên',
    lastName: 'Hệ thống',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'u-2',
    email: 'manager.ban@ecp.com',
    phoneNumber: '0912345678',
    role: 'MANAGER',
    active: true,
    firstName: 'Nguyễn Văn',
    lastName: 'Quản lý',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'u-3',
    email: 'customer.an@gmail.com',
    phoneNumber: '0987654321',
    role: 'USER',
    active: true,
    firstName: 'Trần Văn',
    lastName: 'An',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2026-03-10T14:15:00Z',
  },
];

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
    try {
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
      if (res.ok) {
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
      }
    } catch (e) {
      console.warn('Backend fetch failed, using mock fallback', e);
    }

    // Mock fallback
    let filtered = [...mockUsers];
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(kw) || 
        (u.firstName && u.firstName.toLowerCase().includes(kw)) ||
        (u.lastName && u.lastName.toLowerCase().includes(kw)) ||
        (u.phoneNumber && u.phoneNumber.includes(kw))
      );
    }
    if (params.roles) {
      const rolesList = Array.isArray(params.roles) ? params.roles : params.roles.split(',');
      filtered = filtered.filter(u => rolesList.includes(u.role));
    } else if (params.role) {
      filtered = filtered.filter(u => u.role === params.role);
    }
    if (params.active !== undefined) {
      filtered = filtered.filter(u => u.active === params.active);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / params.size) || 1;
    const start = (params.page - 1) * params.size;
    const pagedItems = filtered.slice(start, start + params.size).map(mapBackendUserToFrontend);

    return {
      success: true,
      message: 'Lấy dữ liệu thành công (Mock)',
      data: pagedItems,
      pagination: {
        currentPage: params.page,
        totalPages,
        totalElements: total,
        pageSize: params.size,
        first: params.page === 1,
        last: params.page >= totalPages,
      },
    };
  },

  // Lấy thông tin chi tiết 1 người dùng theo ID
  getById: async (id: string): Promise<User> => {
    try {
      const res = await clientFetch(`v1/users/${id}`);
      if (res.ok) {
        const result = await res.json();
        return mapBackendUserToFrontend(result.data);
      }
    } catch (e) {
      console.warn('Backend getById failed, using mock fallback', e);
    }
    const found = mockUsers.find(u => u.id === id);
    if (!found) throw new Error('Không tìm thấy người dùng');
    return mapBackendUserToFrontend(found);
  },

  // Tạo mới nhân viên / người dùng
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
    };

    try {
      const res = await clientFetch(`v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        return mapBackendUserToFrontend(result.data);
      }
    } catch (e) {
      console.warn('Backend create failed, using mock fallback', e);
    }

    // Fallback logic
    const newUser: BackendUserResponse = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      active: payload.active,
      firstName: payload.firstName,
      lastName: payload.lastName,
      avatarUrl: payload.avatarUrl,
      avatarPublicId: payload.avatarPublicId,
      createdAt: new Date().toISOString(),
    };

    mockUsers.unshift(newUser);
    return mapBackendUserToFrontend(newUser);
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

    try {
      const res = await clientFetch(`v1/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result = await res.json();
        return mapBackendUserToFrontend(result.data);
      }
    } catch (e) {
      console.warn('Backend update failed, using mock fallback', e);
    }

    // Fallback logic
    let updated: BackendUserResponse | null = null;
    mockUsers = mockUsers.map(u => {
      if (u.id === id) {
        const uitem = {
          ...u,
          email: payload.email !== undefined ? payload.email : u.email,
          phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber : u.phoneNumber,
          role: payload.role !== undefined ? payload.role : u.role,
          active: payload.active !== undefined ? payload.active : u.active,
          firstName: payload.firstName || u.firstName,
          lastName: payload.lastName || u.lastName,
          avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : u.avatarUrl,
        };
        updated = uitem;
        return uitem;
      }
      return u;
    });

    if (!updated) throw new Error('Không tìm thấy người dùng');
    return mapBackendUserToFrontend(updated);
  },

  // Xóa/Ngừng hoạt động người dùng
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await clientFetch(`v1/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        mockUsers = mockUsers.filter(u => u.id !== id);
        return { success: true };
      }
    } catch (e) {
      console.warn('Backend delete failed, using mock fallback', e);
    }
    // Fallback
    mockUsers = mockUsers.filter(u => u.id !== id);
    return { success: true };
  },

  // Lấy thống kê số lượng người dùng (MySQL + Redis)
  getStatistics: async (): Promise<UserStatistics> => {
    try {
      const res = await clientFetch('v1/users/statistics');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          const stats = result.data;
          return {
            totalUsers: stats.totalUsers || 0,
            onlineUsers: stats.onlineUsers || 0,
            offlineUsers: stats.offlineUsers || 0,
            managementUsers: stats.managementUsers || 0,
            customerUsers: stats.customerUsers !== undefined ? stats.customerUsers : (stats.totalUsers - stats.managementUsers),
          };
        }
      }
    } catch (e) {
      console.warn('Backend statistics failed, using mock fallback', e);
    }

    // Fallback logic
    const total = mockUsers.length;
    const management = mockUsers.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'MANAGER').length;
    const customers = mockUsers.filter(u => u.role === 'USER').length;
    const online = mockUsers.filter(u => u.id === 'u-1' || u.id === 'u-2').length;

    return {
      totalUsers: total,
      onlineUsers: online,
      offlineUsers: total - online,
      managementUsers: management,
      customerUsers: customers,
    };
  },
};

export interface UserStatistics {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  managementUsers: number;
  customerUsers: number;
}
