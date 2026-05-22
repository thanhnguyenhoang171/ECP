export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  lastActive: string;
  createdAt: string;
}

export const ROLE_OPTIONS: { value: User['role']; label: string; color: string }[] = [
  { value: 'admin', label: 'Admin', color: 'text-purple-600 bg-purple-50' },
  { value: 'manager', label: 'Quản lý', color: 'text-blue-600 bg-blue-50' },
  { value: 'staff', label: 'Nhân viên', color: 'text-green-600 bg-green-50' },
  { value: 'viewer', label: 'Xem chỉ', color: 'text-slate-600 bg-slate-50' },
];

export const MOCK_USERS: User[] = [
  { id: 'USR001', fullName: 'Nguyễn Văn A', email: 'nguyenvana@ecp.vn', phone: '0912345671', role: 'admin', status: 'active', isOnline: true, lastActive: 'Đang hoạt động', createdAt: '2024-01-15' },
  { id: 'USR002', fullName: 'Trần Thị B', email: 'tranthib@ecp.vn', phone: '0912345672', role: 'manager', status: 'active', isOnline: true, lastActive: 'Đang hoạt động', createdAt: '2024-02-20' },
  { id: 'USR003', fullName: 'Lê Văn C', email: 'levanc@ecp.vn', phone: '0912345673', role: 'staff', status: 'active', isOnline: false, lastActive: '5 phút trước', createdAt: '2024-03-10' },
  { id: 'USR004', fullName: 'Phạm Thị D', email: 'phamthid@ecp.vn', phone: '0912345674', role: 'staff', status: 'active', isOnline: false, lastActive: '1 giờ trước', createdAt: '2024-03-15' },
  { id: 'USR005', fullName: 'Hoàng Văn E', email: 'hoangvane@ecp.vn', phone: '0912345675', role: 'viewer', status: 'active', isOnline: true, lastActive: 'Đang hoạt động', createdAt: '2024-04-01' },
  { id: 'USR006', fullName: 'Đỗ Thị G', email: 'dothig@ecp.vn', phone: '0912345676', role: 'staff', status: 'inactive', isOnline: false, lastActive: '2 ngày trước', createdAt: '2024-04-10' },
  { id: 'USR007', fullName: 'Vũ Văn H', email: 'vuvanh@ecp.vn', phone: '0912345677', role: 'manager', status: 'active', isOnline: false, lastActive: '30 phút trước', createdAt: '2024-05-05' },
  { id: 'USR008', fullName: 'Ngô Thị K', email: 'ngothik@ecp.vn', phone: '0912345678', role: 'staff', status: 'suspended', isOnline: false, lastActive: '1 tuần trước', createdAt: '2024-05-20' },
];
