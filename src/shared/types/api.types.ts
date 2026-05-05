export type ApiResponse<T> = {
  success: true;
  code: 'SUCCESS' | string;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiFieldError = {
  field?: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  code: string;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
  path?: string;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginatedItems<T> = PagedResponse<T>;

export type OptionItem = {
  label: string;
  value: string;
};
