
import { LoginFormValues, RegisterFormValues } from '../schemas/auth.schema';
import { LoginResponse, RegisterResponse, LogoutResponse } from '../types/auth.interface';

export const authApi = {
  login: async (values: LoginFormValues): Promise<LoginResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  register: async (values: RegisterFormValues): Promise<RegisterResponse> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  logout: async (token?: string): Promise<LogoutResponse> => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  refresh: async (): Promise<any> => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  }
};
