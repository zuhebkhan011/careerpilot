import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`❌ API Error [${req.method} ${req.path}]:`, err);

  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Validation failed for request parameters',
        details: err.errors,
      },
    };
    return res.status(400).json(response);
  }

  const statusCode = err.statusCode || 500;
  const response: ApiResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred while processing your request.',
    },
  };

  return res.status(statusCode).json(response);
}
