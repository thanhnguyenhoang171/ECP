import { User } from '../types/user.interface';
import { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage, syncPagination } from '@/lib/utils';

export interface BackendUserResponse {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
  isActive?: boolean;
  active?: boolean;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mapBackendUserToFrontend = (b: BackendUserResponse): User => {
  const isAct = b.active !== undefined ? b.active : (b.isActive !== undefined ? b.isActive : true);
  return {
    id: b.id,
    username: b.username,
    fullName: [b.firstName, b.lastName].filter(Boolean).join(' ').trim() || b.username || b.email,
    email: b.email,
    phone: b.phoneNumber || '',
    role: b.role,
    status: isAct ? 'active' : 'inactive',
    isOnline: b.id === 'u-1' || b.id === 'u-2', // Giả lập online
    lastActive: 'Không rõ',
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '',
  };
};

// Cơ sở dữ liệu in-memory mẫu trên client
let mockUsers: BackendUserResponse[] = [
  {
    id: 'u-1',
    username: 'admin',
    email: 'admin@cacao.com',
    phoneNumber: '0912345678',
    role: 'SUPER_ADMIN',
    active: true,
    firstName: 'Hùng',
    lastName: 'Nguyễn',
    createdAt: '2026-01-15T08:30:00Z',
  },
  {
    id: 'u-2',
    username: 'manager_quang',
    email: 'quang.manager@cacao.com',
    phoneNumber: '0987654321',
    role: 'MANAGER',
    active: true,
    firstName: 'Quang',
    lastName: 'Trần',
    createdAt: '2026-02-10T14:45:00Z',
  },
  {
    id: 'u-3',
    username: 'staff_an',
    email: 'an.staff@cacao.com',
    phoneNumber: '0905123456',
    role: 'USER',
    active: true,
    firstName: 'An',
    lastName: 'Phạm',
    createdAt: '2026-03-22T09:15:00Z',
  },
  {
    id: 'u-4',
    username: 'staff_binh',
    email: 'binh.staff@cacao.com',
    phoneNumber: '0935987654',
    role: 'USER',
    active: false,
    firstName: 'Bình',
    lastName: 'Lê',
    createdAt: '2026-04-05T16:00:00Z',
  }
];

export const userApi = {
  // Lấy danh sách người dùng có phân trang và lọc
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    keyword?: string;
    role?: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
    active?: boolean;
  }): Promise<PageResponse<User>> => {
    try {
      const query = new URLSearchParams();
      query.append('page', toApiPage(params.page).toString());
      query.append('size', params.size.toString());
      if (params.sort) query.append('sort', params.sort);
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.role) query.append('role', params.role);
      if (params.active !== undefined)
        query.append('active', params.active.toString());

      const res = await clientFetch(`v1/users?${query.toString()}`);
      if (res.ok) {
        const result: PageResponse<BackendUserResponse> = await res.json();
        const mappedData: User[] = (result.data || []).map(mapBackendUserToFrontend);
        const mappedResult: PageResponse<User> = {
          ...result,
          data: mappedData,
        };
        return syncPagination<PageResponse<User>>(mappedResult);
      }
    } catch (e) {
      console.warn('Backend getPaged failed, using mock fallback', e);
    }

    // Fallback logic
    let filtered = [...mockUsers];
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(kw) || 
        u.email.toLowerCase().includes(kw) ||
        (u.firstName && u.firstName.toLowerCase().includes(kw)) ||
        (u.lastName && u.lastName.toLowerCase().includes(kw))
      );
    }
    if (params.role) {
      filtered = filtered.filter(u => u.role === params.role);
    }
    if (params.active !== undefined) {
      filtered = filtered.filter(u => {
        const isAct = u.active !== undefined ? u.active : (u.isActive !== undefined ? u.isActive : true);
        return isAct === params.active;
      });
    }

    // Sorting
    if (params.sort) {
      const [field, order] = params.sort.split(',');
      filtered.sort((a, b) => {
        let valA = (a as any)[field] || '';
        let valB = (b as any)[field] || '';
        if (field === 'createdAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / params.size) || 1;
    const start = (params.page - 1) * params.size;
    const end = start + params.size;
    const paginated = filtered.slice(start, end);

    return {
      success: true,
      data: paginated.map(mapBackendUserToFrontend),
      pagination: {
        currentPage: params.page,
        totalPages: totalPages,
        totalElements: totalElements,
        pageSize: params.size,
        last: params.page >= totalPages,
        first: params.page === 1,
      }
    };
  },

  // Tạo mới nhân viên
  create: async (data: any): Promise<User> => {
    try {
      const res = await clientFetch(`v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        return mapBackendUserToFrontend(result.data);
      }
    } catch (e) {
      console.warn('Backend create failed, using mock fallback', e);
    }

    // Fallback logic
    const names = data.fullName.trim().split(' ');
    const lastName = names[names.length - 1] || '';
    const firstName = names.slice(0, names.length - 1).join(' ') || data.fullName;

    const newUser: BackendUserResponse = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username: data.username,
      email: data.email,
      phoneNumber: data.phone,
      role: data.role,
      active: data.status === 'active',
      firstName: firstName,
      lastName: lastName,
      createdAt: new Date().toISOString(),
    };

    mockUsers.unshift(newUser);
    return mapBackendUserToFrontend(newUser);
  },

  // Chỉnh sửa nhân viên
  update: async (id: string, data: any): Promise<User> => {
    try {
      const res = await clientFetch(`v1/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        return mapBackendUserToFrontend(result.data);
      }
    } catch (e) {
      console.warn('Backend update failed, using mock fallback', e);
    }

    // Fallback logic
    const names = data.fullName.trim().split(' ');
    const lastName = names[names.length - 1] || '';
    const firstName = names.slice(0, names.length - 1).join(' ') || data.fullName;

    let updated: BackendUserResponse | null = null;
    mockUsers = mockUsers.map(u => {
      if (u.id === id) {
        const uitem = {
          ...u,
          username: data.username,
          email: data.email,
          phoneNumber: data.phone,
          role: data.role,
          active: data.status === 'active',
          firstName: firstName,
          lastName: lastName,
        };
        updated = uitem;
        return uitem;
      }
      return u;
    });

    if (!updated) throw new Error('Không tìm thấy nhân viên');
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
        return result.success ? result.data : { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0 };
      }
    } catch (e) {
      console.warn('Backend statistics failed, using mock fallback', e);
    }

    // Fallback logic
    const total = mockUsers.length;
    const management = mockUsers.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'MANAGER').length;
    const online = mockUsers.filter(u => u.id === 'u-1' || u.id === 'u-2').length;

    return {
      totalUsers: total,
      onlineUsers: online,
      offlineUsers: total - online,
      managementUsers: management,
    };
  },
};

export interface UserStatistics {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  managementUsers: number;
}
