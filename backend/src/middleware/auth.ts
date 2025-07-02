import { Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { AuthRequest, User } from '@/types';
import logger from '@/utils/logger';
import { logSecurityEvent } from '@/config/mongodb';

/**
 * Authentication middleware for protected routes
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.get('Authorization');
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    // Validate session and get user
    const { user, session } = await AuthService.validateSession(token);

    // Attach user and session to request
    req.user = user;
    req.session = session ?? undefined;

    // Log successful authentication
    logger.debug('User authenticated', {
      userId: user.id,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    let statusCode = 401;
    let errorCode = 'AUTHENTICATION_FAILED';
    let message = 'Authentication failed';

    if (error instanceof Error) {
      switch (error.message) {
        case 'ACCESS_TOKEN_EXPIRED':
          errorCode = 'TOKEN_EXPIRED';
          message = 'Access token expired';
          break;
        case 'INVALID_ACCESS_TOKEN':
          errorCode = 'INVALID_TOKEN';
          message = 'Invalid access token';
          break;
        case 'SESSION_NOT_FOUND':
          errorCode = 'SESSION_INVALID';
          message = 'Session not found or expired';
          break;
        case 'USER_NOT_FOUND':
          errorCode = 'USER_NOT_FOUND';
          message = 'User not found or inactive';
          break;
        case 'INVALID_TOKEN_HASH':
          errorCode = 'TOKEN_COMPROMISED';
          message = 'Token hash mismatch';
          statusCode = 403;
          break;
      }
    }

    // Log failed authentication attempt
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });

    // Log security event
    try {
      await logSecurityEvent({
        event_type: 'authentication_failure',
        severity: 'medium',
        description: `Authentication failed: ${message}`,
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          url: req.originalUrl,
          method: req.method,
          error_code: errorCode
        }
      });
    } catch (logError) {
      logger.error('Failed to log security event', {
        error: logError instanceof Error ? logError.message : 'Unknown error'
      });
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      code: errorCode
    });
  }
};

/**
 * Authorization middleware for role-based access control
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    const userRole = req.user.role as string;
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole,
        allowedRoles,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });

      // Log security event
      void logSecurityEvent({
        user_id: req.user.id as string,
        event_type: 'authorization_failure',
        severity: 'medium',
        description: `User attempted to access restricted resource`,
        metadata: {
          user_role: userRole,
          allowed_roles: allowedRoles,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          url: req.originalUrl,
          method: req.method
        }
      });

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

/**
 * Permission-based authorization middleware (for API keys)
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    // If authenticated via API key, check permissions
    if (req.apiKey) {
      const { ApiKeyService } = await import('@/services/ApiKeyService');
      const hasPermission = ApiKeyService.hasPermission(req.apiKey, permission);
      
      if (!hasPermission) {
        logger.warn('API key permission denied', {
          userId: req.user.id,
          keyId: req.apiKey.id,
          requiredPermission: permission,
          keyPermissions: req.apiKey.permissions,
          ip: req.ip,
          url: req.originalUrl,
          method: req.method
        });

        res.status(403).json({
          success: false,
          error: `Permission '${permission}' required`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }
    }
    // If authenticated via JWT, check role-based permissions
    else {
      const userRole = req.user.role as string;
      
      // Basic permission mapping for common operations
      const rolePermissions: Record<string, string[]> = {
        admin: ['*'], // Admin has all permissions
        user: ['models:read', 'models:write', 'scans:read', 'scans:write'],
        analyst: ['models:read', 'scans:read', 'alerts:read'],
        viewer: ['models:read', 'scans:read']
      };

      const userPermissions = rolePermissions[userRole] || [];
      const hasPermission = userPermissions.includes('*') || 
                           userPermissions.includes(permission) ||
                           userPermissions.includes(permission.split(':')[0] + ':*');

      if (!hasPermission) {
        logger.warn('User permission denied', {
          userId: req.user.id,
          userRole,
          requiredPermission: permission,
          ip: req.ip,
          url: req.originalUrl,
          method: req.method
        });

        res.status(403).json({
          success: false,
          error: `Permission '${permission}' required`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }
    }

    next();
  };
};

/**
 * Optional authentication middleware (user may or may not be authenticated)
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('Authorization');
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (token) {
      const { user, session } = await AuthService.validateSession(token);
      req.user = user;
      req.session = session ?? undefined;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail the request if auth fails
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });
    next();
  }
};

/**
 * Middleware to check if user account is verified
 */
export const requireVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
    return;
  }

  if (!req.user.is_verified) {
    res.status(403).json({
      success: false,
      error: 'Email verification required',
      code: 'VERIFICATION_REQUIRED'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user account is active
 */
export const requireActiveAccount = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
    return;
  }

  if (!req.user.is_active) {
    res.status(403).json({
      success: false,
      error: 'Account is inactive',
      code: 'ACCOUNT_INACTIVE'
    });
    return;
  }

  next();
};

/**
 * Middleware for API key authentication
 */
export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.get('X-API-Key') || req.query['api_key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
      return;
    }

    // Validate API key
    const { ApiKeyService } = await import('@/services/ApiKeyService');
    const { keyData, user, isValid } = await ApiKeyService.validateApiKey(apiKey);

    if (!isValid || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
      return;
    }

    // Check rate limit
    const rateLimitResult = await ApiKeyService.checkRateLimit(keyData, req.ip);
    if (!rateLimitResult.allowed) {
      res.set({
        'X-RateLimit-Limit': keyData.rate_limit_per_hour?.toString() || '1000',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString()
      });

      res.status(429).json({
        success: false,
        error: 'API rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
      });
      return;
    }

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': keyData.rate_limit_per_hour?.toString() || '1000',
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString()
    });

    // Attach user and API key data to request
    req.user = user as User;
    req.apiKey = keyData;

    logger.debug('API key authentication successful', {
      userId: (user as User).id,
      keyId: keyData.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('API key authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip
    });

    res.status(401).json({
      success: false,
      error: 'API key authentication failed',
      code: 'API_KEY_AUTHENTICATION_FAILED'
    });
  }
};

/**
 * Middleware to extract user information from JWT without enforcing authentication
 */
export const extractUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.get('Authorization');
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload = AuthService.verifyAccessToken(token);
        // Don't fetch full user, just use payload info for lightweight operations
        req.user = {
          id: payload.userId,
          role: payload.role
        } as import('@/types').User;
      } catch {
        // Ignore token verification errors for this middleware
      }
    }

    next();
  } catch (error) {
    // Always continue for this middleware
    next();
  }
};