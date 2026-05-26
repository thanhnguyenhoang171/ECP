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
    isOnline: false,
    lastActive: 'Không rõ',
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '',
  };
};

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
    const query = new URLSearchParams();

    // Pageable params
    query.append('page', toApiPage(params.page).toString());
    query.append('size', params.size.toString());
    if (params.sort) query.append('sort', params.sort);

    // Filter params
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.role) query.append('role', params.role);
    if (params.active !== undefined)
      query.append('active', params.active.toString());

    const res = await clientFetch(`v1/users?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const result: PageResponse<BackendUserResponse> = await res.json();
    
    // Ánh xạ dữ liệu từ backend sang cấu trúc frontend
    const mappedData: User[] = (result.data || []).map(mapBackendUserToFrontend);
    
    const mappedResult: PageResponse<User> = {
      ...result,
      data: mappedData,
    };
    
    return syncPagination<PageResponse<User>>(mappedResult);
  },

  // Xóa/Ngừng hoạt động người dùng
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await clientFetch(`v1/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.message || 'Failed to delete user');
    }
    return { success: true };
  },

  // Lấy thống kê số lượng người dùng (MySQL + Redis)
  getStatistics: async (): Promise<UserStatistics> => {
    const res = await clientFetch('v1/users/statistics');
    if (!res.ok) throw new Error('Failed to fetch user statistics');
    const result = await res.json();
    return result.success ? result.data : { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0 };
  },
};

export interface UserStatistics {
  totalUsers: number;
  onlineUsers: number;
  offlineUsers: number;
  managementUsers: number;
}



