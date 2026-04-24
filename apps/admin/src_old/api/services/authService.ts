import axiosInstance from '../axiosInstance';
import type {
  LoginRequest,
  AuthResponse,
  ApiResponse,
  User,
  RegisterReqsuest,
  RegisterResponse,
} from '../../interfaces';

export const authService = {
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/login', data);
  },

  register: (
    data: RegisterReqsuest,
  ): Promise<ApiResponse<RegisterResponse>> => {
    return axiosInstance.post('/auth/register', data);
  },

  getProfile: (): Promise<ApiResponse<User>> => {
    return axiosInstance.get('/auth/profile');
  },

  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },
};
