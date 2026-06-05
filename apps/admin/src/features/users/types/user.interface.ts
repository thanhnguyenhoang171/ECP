export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'USER';
  status: 'active' | 'inactive';
  isOnline: boolean;
  lastActive: string;
  createdAt: string;
}

export const ROLE_OPTIONS: { value: User['role']; label: string; color: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Admin', color: 'text-purple-600 bg-purple-50' },
  { value: 'MANAGER', label: 'Quản lý', color: 'text-blue-600 bg-blue-50' },
  { value: 'USER', label: 'Nhân viên', color: 'text-green-600 bg-green-50' },
];

