import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { checkRateLimit } from '@/config/redis';
import logger from '@/utils/logger';
import config from '@/config';

export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message ?? 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        error: message ?? 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

// General API rate limiter
export const apiLimiter = createRateLimiter(
  config.rate_limit.window_ms,
  config.rate_limit.max_requests,
  'Too many API requests'
);

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts'
);

// File upload rate limiter
export const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads
  'Too many file uploads'
);

// Password reset rate limiter
export const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts
  'Too many password reset attempts'
);

// Custom Redis-based rate limiter for authenticated users
export const customRateLimiter = (options: {
  keyGenerator: (req: Request) => string;
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = options.keyGenerator(req);
      const windowSeconds = Math.ceil(options.windowMs / 1000);
      
      const result = await checkRateLimit(key, options.max, windowSeconds);
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString()
      });
      
      if (!result.allowed) {
        logger.warn('Custom rate limit exceeded', {
          key,
          current: result.current,
          limit: options.max,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });
        
        res.status(429).json({
          success: false,
          error: options.message ?? 'Rate limit exceeded',
          retryAfter: windowSeconds,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      next();
    } catch (error) {
      logger.error('Rate limiter error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key: options.keyGenerator(req)
      });
      // Continue on error to avoid blocking requests
      next();
    }
  };
};