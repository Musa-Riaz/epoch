// Example global API types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: any;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Response } from 'express';

export function sendSuccess<T>({ res, data, status = 200, message, pagination }: { res: Response; data: T; status?: number; message?: string; pagination?: Pagination }) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination
  };
  res.status(status).json(response);
}

export function sendError({ res, error, details, status = 400 }: { res: Response, error: string, details?: any, status?: number }) {
  const isProduction = process.env.NODE_ENV === 'production';
  const response: ApiResponse<any> = {
    success: false,
    data: null as any,
    error,
  };

  if (!isProduction && details !== undefined) {
    response.details = details;
  }

  res.status(status).json(response);
}
