export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export interface Product {
  key: string;
  id: string | number;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'disabled';
  category?: string;
  description?: string;
  image?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}