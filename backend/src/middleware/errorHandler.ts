import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  errors?: Record<string, { message: string }>;
}

interface ErrorResponse {
  success: false;
  error: string;
  stack?: string;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

export const errorHandler = (
  err: CustomError,
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): void => {
  let error: { message: string; statusCode: number } = {
    message: err.message,
    statusCode: err.statusCode ?? 500
  };

  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    error = { message: 'Duplicate entry', statusCode: 400 };
  }

  if (err.code === '23503') { // Foreign key violation
    error = { message: 'Referenced resource not found', statusCode: 400 };
  }

  if (err.code === '23502') { // Not null violation
    error = { message: 'Missing required field', statusCode: 400 };
  }

  if (err.code === '42P01') { // Undefined table
    error = { message: 'Database table not found', statusCode: 500 };
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    error = { message: 'Too many requests, please try again later', statusCode: 429 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'File too large', statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { message: 'Unexpected file field', statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = { message: 'Too many files', statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = { message: 'Invalid input data', statusCode: 400 };
  }

  const response: ErrorResponse = {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
    requestId: (req as unknown as Request & { id?: string }).id ?? 'unknown'
  };

  // Include stack trace and details in development
  if (process.env['NODE_ENV'] === 'development') {
    if (err.stack) response.stack = err.stack;
    response.details = err;
  }

  res.status(error.statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn('Route not found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};