import { LoginFormValues, RegisterFormValues } from '../schemas/auth.schema';
import { LoginResponse, RegisterResponse, LogoutResponse, UpdateUserAccountPayload, UserAccountResponse } from '../types/auth.interface';

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
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  getAccountInfo: async (): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const response = await clientFetch('v1/users/me');
    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  updateAccountInfo: async (payload: UpdateUserAccountPayload): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const response = await clientFetch('v1/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  uploadAvatar: async (file: File): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const formData = new FormData();
    formData.append('file', file);

    const response = await clientFetch('v1/users/me/avatar', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  deleteAvatar: async (): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const response = await clientFetch('v1/users/me/avatar', {
      method: 'DELETE',
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  uploadBanner: async (file: File): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const formData = new FormData();
    formData.append('file', file);

    const response = await clientFetch('v1/users/me/banner', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  },

  deleteBanner: async (): Promise<UserAccountResponse> => {
    const { clientFetch } = await import('@/lib/clientFetch');
    const response = await clientFetch('v1/users/me/banner', {
      method: 'DELETE',
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  }
};
