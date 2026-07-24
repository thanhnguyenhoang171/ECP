// ─── Auth User (thông tin người dùng từ API) ──────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  addresses?: Address[];
}

// ─── Dữ liệu trả về trong data của API Login/Register/Refresh ─────────────────
export interface AuthData {
  id: string;
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
  roles: string[];
}

// ─── Cấu trúc response tổng quát từ API Auth ──────────────────────────────────
export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: AuthData;
}

// ─── Legacy types (giữ lại để tránh lỗi biên dịch nếu còn import) ─────────────
export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

/** @deprecated Dùng AuthUser thay thế */
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  memberTier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  rewardPoints: number;
  addresses: Address[];
}
