import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/utils/logger';
import config from '@/config';

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors_origin.split(',').map(o => o.trim());
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn('CORS origin blocked', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ]
};

// Helmet security configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Request ID middleware
export const requestId = (req: Request & { id?: string }, res: Response, next: NextFunction): void => {
  req.id = req.get('X-Request-ID') ?? uuidv4();
  res.set('X-Request-ID', req.id);
  next();
};

// Request logging middleware
export const requestLogger = (_req: Request & { startTime?: number }, res: Response, next: NextFunction): void => {
  _req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(body: unknown) {
    const duration = Date.now() - (_req.startTime ?? Date.now());
    
    logger.info('HTTP Request', {
      method: _req.method,
      url: _req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: _req.ip,
      userAgent: _req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      requestId: (_req as Request & { id?: string }).id
    });
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });
  next();
};

// Body parser size limits
export const bodyParserLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true }
};

// Compression middleware with configuration
export const compressionConfig = compression({
  filter: (req: Request, _res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, _res);
  },
  threshold: 1024 // Only compress responses larger than 1KB
});

// IP validation middleware
export const validateIP = (_req: Request, _res: Response, next: NextFunction): void => {
  const ip = _req.ip ?? _req.connection.remoteAddress;
  
  if (!ip) {
    logger.warn('Request without IP address', {
      url: _req.url,
      method: _req.method,
      headers: _req.headers
    });
  }
  
  // Add any IP blocking logic here if needed
  next();
};

// Request size validation
export const validateRequestSize = (maxSize = '50mb') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') ?? '0', 10);
    const maxBytes = parseFloat(maxSize) * (maxSize.includes('mb') ? 1024 * 1024 : 1024);
    
    if (contentLength > maxBytes) {
      logger.warn('Request too large', {
        contentLength,
        maxSize,
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      
      _res.status(413).json({
        success: false,
        error: 'Request entity too large',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    next();
  };
};