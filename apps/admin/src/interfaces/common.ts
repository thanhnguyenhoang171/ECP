export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type Status = 'active' | 'inactive' | 'disabled' | 'out_of_stock';

export interface DetectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
  prob: number;
}
