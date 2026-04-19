export type UserRole = 'admin' | 'staff' | 'user';

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: 'active' | 'inactive' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
}
