export type ApiSuccess<T> = {
  success: true;
  code: string;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorItem = {
  field?: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  code: string;
  message: string;
  errors?: ApiErrorItem[];
  timestamp: string;
  path?: string;
};

export type PaginatedItems<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type OptionItem = {
  label: string;
  value: string;
};

