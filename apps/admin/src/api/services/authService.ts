import axiosInstance from '../axiosInstance';

export const authService = {
  login: (data: any) => {
    return axiosInstance.post('/auth/login', data);
  },
  
  register: (data: any) => {
    return axiosInstance.post('/auth/register', data);
  },
  
  getProfile: () => {
    return axiosInstance.get('/auth/profile');
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};