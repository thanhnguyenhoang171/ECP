export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
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
    username: string;
    email: string;
    roles: string[];
  };
}
