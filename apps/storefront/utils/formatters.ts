/**
 * Utility định dạng tiền tệ VND
 */
export const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

/**
 * Utility chuyển đổi mã vai trò (Role) sang tên hiển thị chuẩn tiếng Việt
 */
export const formatRoleLabel = (role?: string): string => {
  if (!role) return 'Khách hàng';
  const cleanRole = role.replace('ROLE_', '').toUpperCase();
  switch (cleanRole) {
    case 'SUPER_ADMIN':
      return 'Quản trị viên hệ thống';
    case 'MANAGER':
      return 'Quản lý viên hệ thống';
    case 'USER':
    default:
      return 'Khách hàng';
  }
};
