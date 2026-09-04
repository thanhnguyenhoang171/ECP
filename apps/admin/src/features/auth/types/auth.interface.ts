export interface User {
  id: string;
  email: string;
  roles: string[];
  provider?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt?: string;
  updatedAt?: string;
  phoneVerified?: boolean;
  active?: boolean;
  emailVerified?: boolean;
}

export interface UserAccountData {
  id: string;
  email: string;
  provider?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  roles: string[];
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  phoneVerified?: boolean;
  active?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserAccountPayload {
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  dob?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  bannerUrl?: string | null;
  bannerPublicId?: string | null;
}

export interface UserAccountResponse {
  success: boolean;
  message: string;
  code: string;
  data: UserAccountData;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    roles: string[];
    accessToken: string;
  };
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    accessToken: string;
    email: string;
    roles: string[];
  };
}
