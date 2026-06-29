/**
 * Standard API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * Standard Pagination Response
 */
export interface ApiPageResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    last: boolean;
    first: boolean;
  };
}

/**
 * Base Search Params
 */
export interface BaseQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}
