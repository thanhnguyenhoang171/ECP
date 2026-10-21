import { resolveCatalogImage, readCatalogResult } from '@/lib/catalog-api';
import type { UserFormValues } from '../schemas/user.schema';
import type { User } from '../types/user.interface';
import type { PageResponse } from '@/types/pagination';
import { clientFetch } from '@/lib/clientFetch';
import { toApiPage } from '@/lib/utils';

export interface UserMutationData extends Partial<UserFormValues> {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
  active?: boolean;
  avatarFile?: File;
}

export interface BackendUserResponse {
  id: string;
  email: string;
  roles?: string[];
  role?: string;
  phoneNumber?: string;
  active?: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  online?: boolean;
  lastLoginAt?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};

export const normalizeRole = (value: unknown): User['role'] => {
  const item = record(value);
  const roles = (Array.isArray(item.roles) ? item.roles : [item.role]).map((role: unknown) => {
    const source = typeof role === 'string' ? role : record(role).code || record(role).authority || record(role).name;
    return String(source || '').trim().toUpperCase().replace(/^ROLE_/, '');
  });
  if (roles.includes('SUPER_ADMIN')) { return 'SUPER_ADMIN'; }
  if (roles.includes('MANAGER')) { return 'MANAGER'; }
  return 'USER';
};

export const normalizeOnlineStatus = (value: unknown): boolean => {
  const item = record(value);
  return item.isOnline === true || item.online === true;
};

export const normalizeLastActive = (value: unknown): string => {
  const item = record(value);
  return typeof item.lastLoginAt === 'string' ? item.lastLoginAt : 'Chưa đăng nhập';
};

export const mapBackendUserToFrontend = (user: BackendUserResponse): User => ({
  id: user.id, email: user.email,
  fullName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email,
  firstName: user.firstName, lastName: user.lastName, phone: user.phoneNumber || '',
  role: normalizeRole(user), roles: user.roles || (user.role ? [user.role] : ['USER']),
  status: (user.active ?? user.isActive ?? false) ? 'active' : 'inactive',
  isOnline: normalizeOnlineStatus(user), lastActive: normalizeLastActive(user),
  avatarUrl: user.avatarUrl || '', avatarPublicId: user.avatarPublicId || '', provider: user.provider,
  createdAt: user.createdAt || '', updatedAt: user.updatedAt, createdBy: user.createdBy, updatedBy: user.updatedBy, deletedBy: user.deletedBy, deletedAt: user.deletedAt,
});

export interface UserListParams {
  page: number;
  size: number;
  sort?: string;
  keyword?: string;
  role?: User['role'];
  roles?: string[] | string;
  active?: boolean;
}

export const userQuery = (params: UserListParams): URLSearchParams => {
  const query = new URLSearchParams({ page: String(toApiPage(params.page)), size: String(params.size) });
  if (params.sort) { query.set('sort', params.sort); }
  if (params.keyword?.trim()) { query.set('keyword', params.keyword.trim()); }
  const roles = params.roles ? (Array.isArray(params.roles) ? params.roles : params.roles.split(',')) : params.role ? [params.role] : [];
  for (const role of roles) { if (role.trim()) { query.append('roles', role.trim()); } }
  if (params.active !== undefined) { query.set('active', String(params.active)); }
  return query;
};

const readUser = async (response: Response): Promise<User> => mapBackendUserToFrontend(
  (await readCatalogResult<BackendUserResponse>(response, 'Không thể lưu hoặc tải tài khoản')).data,
);

const nameParts = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0], lastName: parts.length > 1 ? parts[parts.length - 1] : '' };
};

export const userApi = {
  getPaged: async (params: UserListParams): Promise<PageResponse<User>> => {
    const response = await clientFetch(`v1/users?${userQuery(params)}`);
    const result = await readCatalogResult<BackendUserResponse[]>(response, 'Không thể tải danh sách tài khoản');
    const page = result as typeof result & { pagination: PageResponse<User>['pagination'] };
    return { ...result, data: result.data.map(mapBackendUserToFrontend), pagination: page.pagination };
  },
  getById: async (id: string): Promise<User> => readUser(await clientFetch(`v1/users/${id}`)),
  create: async (data: UserMutationData): Promise<User> => {
    const avatar = await resolveCatalogImage(data.avatarFile || data.avatarUrl, 'avatars');
    const names = nameParts(data.fullName || '');
    return readUser(await clientFetch('v1/users', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email?.trim().toLowerCase(), password: data.password,
        firstName: data.firstName ?? names.firstName, lastName: data.lastName ?? names.lastName,
        phoneNumber: data.phoneNumber ?? data.phone ?? '', roles: data.roles ?? [data.role || 'USER'],
        active: data.active ?? (data.status ? data.status === 'active' : true), avatarUrl: avatar.url,
        avatarPublicId: avatar.publicId || data.avatarPublicId || '' }),
    }));
  },
  update: async (id: string, data: UserMutationData): Promise<User> => {
    const payload: Record<string, unknown> = {};
    if (data.fullName !== undefined) { Object.assign(payload, nameParts(data.fullName)); }
    if (data.firstName !== undefined) { payload.firstName = data.firstName; }
    if (data.lastName !== undefined) { payload.lastName = data.lastName; }
    if (data.phoneNumber !== undefined || data.phone !== undefined) { payload.phoneNumber = data.phoneNumber ?? data.phone; }
    if (data.roles !== undefined) { payload.roles = data.roles; }
    else if (data.role !== undefined) { payload.roles = [data.role]; }
    if (data.active !== undefined) { payload.active = data.active; }
    else if (data.status !== undefined) { payload.active = data.status === 'active'; }
    if (data.password) { payload.password = data.password; }
    if (data.avatarFile || data.avatarUrl !== undefined) {
      const avatar = await resolveCatalogImage(data.avatarFile || data.avatarUrl, `avatars/${id}`);
      payload.avatarUrl = avatar.url;
      payload.avatarPublicId = avatar.publicId || data.avatarPublicId || '';
    }
    return readUser(await clientFetch(`v1/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    await readCatalogResult<null>(await clientFetch(`v1/users/${id}`, { method: 'DELETE' }), 'Không thể xoá tài khoản');
    return { success: true };
  },
  getStatistics: async (): Promise<UserStatistics> => (await readCatalogResult<UserStatistics>(
    await clientFetch('v1/users/statistics'), 'Không thể tải thống kê tài khoản',
  )).data,
  export: async (params: Omit<UserListParams, 'page' | 'size'>): Promise<Blob> => {
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Tài khoản', { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = [
      { header: 'Họ và tên', key: 'name', width: 30 }, { header: 'Email', key: 'email', width: 35 },
      { header: 'Số điện thoại', key: 'phone', width: 20 }, { header: 'Vai trò', key: 'roles', width: 30 },
      { header: 'Trạng thái', key: 'status', width: 20 }, { header: 'Tạo lúc', key: 'created', width: 25 },
      { header: 'Đăng nhập lần cuối', key: 'lastLogin', width: 25 },
    ];
    for (let page = 1; ; page += 1) {
      const result = await userApi.getPaged({ ...params, page, size: 100 });
      for (const user of result.data) {
        sheet.addRow({ name: user.fullName, email: user.email, phone: user.phone, roles: (user.roles || [user.role]).join(', '),
          status: user.status === 'active' ? 'Hoạt động' : 'Đã khoá', created: user.createdAt, lastLogin: user.lastActive });
      }
      if (page >= result.pagination.totalPages || result.data.length === 0) { break; }
    }
    sheet.getRow(1).font = { bold: true };
    sheet.autoFilter = 'A1:G1';
    const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
    return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
