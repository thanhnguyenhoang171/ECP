import type { User } from './user';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
}
