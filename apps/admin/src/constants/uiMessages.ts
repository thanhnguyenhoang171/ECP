/**
 * UI display messages – fallback strings used across components.
 * Centralised here to avoid hardcoded literals scattered in the codebase.
 */

export const UI = {
  // ─── Generic ───────────────────────────────────────────────────────────────
  NA: 'N/A',
  NO_ADDRESS: 'Không có địa chỉ',
  NOT_UPDATED: 'Chưa cập nhật',
  UNKNOWN_SUPPLIER: 'Nhà cung cấp',
  UNKNOWN_WAREHOUSE: 'Kho hàng',
  UNKNOWN_WAREHOUSE_RECEIVE: 'Kho nhận',
  AVATAR_ALT: 'Avatar',
  UNKNOWN_USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
  UNKNOWN_PRODUCT: 'Sản phẩm',

  // ─── Warehouse ──────────────────────────────────────────────────────────────
  WAREHOUSE_ADDRESS_NOT_UPDATED: 'Chưa cập nhật địa chỉ',

  // ─── User ───────────────────────────────────────────────────────────────────
  USER_DETAIL_TITLE: 'Chi tiết tài khoản',
  USER_PHONE_NOT_UPDATED: 'Chưa cập nhật số điện thoại',

  // ─── Role ───────────────────────────────────────────────────────────────────
  ROLE_NO_DESCRIPTION: 'Chưa có mô tả chi tiết',
  ROLE_DETAIL_DESCRIPTION:
    'Xem chi tiết thông tin và ma trận phân quyền được cấp cho vai trò.',

  // ─── Supplier ───────────────────────────────────────────────────────────────
  SUPPLIER_TAX_CODE_NOT_UPDATED: 'Chưa cập nhật',

  // ─── Profile ────────────────────────────────────────────────────────────────
  PROFILE_DOB_PLACEHOLDER: 'Chọn ngày sinh...',
  PROFILE_AVATAR_REMOVED: 'Đã gỡ ảnh đại diện.',
} as const;

export type UIKey = keyof typeof UI;
