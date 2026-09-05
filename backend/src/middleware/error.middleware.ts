import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('💥 Internal Server Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, errorCode, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}
