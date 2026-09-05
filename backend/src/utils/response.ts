import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}

export function sendPaginated<T>(res: Response, data: T[], pagination: PaginationMeta, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

export function sendError(res: Response, message: string, errorCode: string = 'BAD_REQUEST', statusCode: number = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(details ? { details } : {}),
  });
}
