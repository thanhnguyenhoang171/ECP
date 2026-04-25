export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  last: boolean;
  first: boolean;
}

export interface PageResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationInfo;
}
