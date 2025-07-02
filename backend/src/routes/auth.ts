import express from 'express';
import { AuthService } from '@/services/AuthService';
import { TokenService } from '@/services/TokenService';
import { UserModel } from '@/models/User';
import { AuthValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  authLimiter, // 5 requests per 15 minutes
  AuthValidators.register(),
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { 
      email, 
      username, 
      password, 
      firstName, 
      lastName,
      inviteToken 
    } = req.body;

    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmailOrUsername(email, username);
      if (existingUser) {
        await logSecurityEvent({
          event_type: 'failed_login',
          severity: 'low',
          description: 'Registration attempt with existing email/username',
          metadata: {
            email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
            username,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.status(409).json({
          success: false,
          error: 'User with this email or username already exists',
          code: 'USER_EXISTS'
        });
        return;
      }

      // Validate invite token if provided
      let inviteData = null;
      if (inviteToken) {
        try {
          inviteData = await TokenService.verifyInvitationToken(inviteToken);
          if (inviteData.email !== email) {
            res.status(400).json({
              success: false,
              error: 'Email does not match invitation',
              code: 'EMAIL_MISMATCH'
            });
            return;
          }
        } catch (error) {
          res.status(400).json({
            success: false,
            error: 'Invalid or expired invitation token',
            code: 'INVALID_INVITE'
          });
          return;
        }
      }

      // Hash password
      const passwordHash = await AuthService.hashPassword(password);

      // Create user
      const userData = {
        email,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: inviteData?.role || 'user',
        is_active: true,
        is_verified: false, // Will be verified via email
        mfa_enabled: false
      };

      const user = await UserModel.create(userData);

      // Create email verification token
      const verificationToken = await TokenService.createEmailVerificationToken(
        user.id as string,
        email
      );

      // Log successful registration
      await logSecurityEvent({
        user_id: user.id as string,
        event_type: 'login',
        severity: 'low',
        description: 'User registration successful',
        metadata: {
          email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
          username,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          has_invite: !!inviteToken
        }
      });

      logger.info('User registration successful', {
        userId: user.id,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        username,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isVerified: user.is_verified
          },
          verificationToken // In production, this would be sent via email
        }
      });
    } catch (error) {
      logger.error('User registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
        username,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.',
        code: 'REGISTRATION_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 */
router.post('/login',
  authLimiter, // 5 requests per 15 minutes
  AuthValidators.login(),
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { email, username, password, rememberMe } = req.body;
    const identifier = email || username;

    try {
      // Find user by email or username
      const user = await UserModel.findByEmailOrUsername(identifier, identifier);
      if (!user) {
        await logSecurityEvent({
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Login attempt with non-existent user',
          metadata: {
            identifier: identifier?.replace(/(.{3}).*(@.*)/, '$1***$2') || 'unknown',
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Check if account is locked
      const isLocked = await AuthService.checkAccountLock(user.id as string);
      if (isLocked) {
        await logSecurityEvent({
          user_id: user.id as string,
          event_type: 'failed_login',
          severity: 'high',
          description: 'Login attempt on locked account',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.status(423).json({
          success: false,
          error: 'Account is temporarily locked due to too many failed login attempts',
          code: 'ACCOUNT_LOCKED'
        });
        return;
      }

      // Verify password
      const isValidPassword = await AuthService.verifyPassword(
        password,
        user.password_hash as string
      );

      if (!isValidPassword) {
        // Handle failed login attempt
        const lockResult = await AuthService.handleFailedLogin(user.id as string);
        
        await logSecurityEvent({
          user_id: user.id as string,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Login attempt with invalid password',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            attempts_remaining: lockResult.attemptsRemaining,
            is_locked: lockResult.isLocked
          }
        });

        const response: {
          success: boolean;
          error: string;
          code: string;
          warning?: string;
        } = {
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };

        if (lockResult.attemptsRemaining <= 2) {
          response.warning = `${lockResult.attemptsRemaining} attempts remaining before account lock`;
        }

        if (lockResult.isLocked) {
          response.error = 'Account locked due to too many failed attempts';
          response.code = 'ACCOUNT_LOCKED';
          res.status(423).json(response);
          return;
        }

        res.status(401).json(response);
        return;
      }

      // Check if user is active
      if (!user.is_active) {
        await logSecurityEvent({
          user_id: user.id as string,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Login attempt on inactive account',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.status(403).json({
          success: false,
          error: 'Account is inactive. Please contact support.',
          code: 'ACCOUNT_INACTIVE'
        });
        return;
      }

      // Reset failed login attempts on successful password verification
      await UserModel.resetFailedAttempts(user.id as string);

      // Check if MFA is enabled for the user
      if (user.mfa_enabled) {
        // Return MFA challenge instead of tokens
        res.json({
          success: true,
          message: 'Password verified. MFA code required.',
          data: {
            mfaRequired: true,
            userId: user.id, // Temporary for MFA verification
            partialAuth: true
          }
        });
        return;
      }

      // Create authentication session (no MFA required)
      const { accessToken, refreshToken, session } = await AuthService.createSession(
        user,
        req.ip,
        req.get('User-Agent')
      );

      // Log successful login
      await logSecurityEvent({
        user_id: user.id as string,
        event_type: 'login',
        severity: 'low',
        description: 'User login successful',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          remember_me: !!rememberMe
        }
      });

      logger.info('User login successful', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
        sessionId: session.id
      });

      // Set refresh token as httpOnly cookie if rememberMe is true
      if (rememberMe) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken: rememberMe ? undefined : refreshToken, // Don't return in response if stored in cookie
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active,
            isVerified: user.is_verified,
            mfaEnabled: user.mfa_enabled,
            lastLoginAt: user.last_login_at
          },
          session: {
            id: session.id,
            expiresAt: session.expires_at
          }
        }
      });
    } catch (error) {
      logger.error('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        identifier,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.',
        code: 'LOGIN_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh',
  authLimiter, // 5 requests per 15 minutes
  AuthValidators.refreshToken(),
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    try {
      // Get refresh token from body or cookie
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED'
        });
        return;
      }

      // Refresh the access token
      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshAccessToken(
        refreshToken,
        req.ip
      );

      // Update refresh token cookie if it was stored there
      if (req.cookies.refreshToken) {
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      logger.info('Token refresh successful', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: req.cookies.refreshToken ? undefined : newRefreshToken
        }
      });
    } catch (error) {
      logger.warn('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip
      });

      // Clear refresh token cookie on failure
      res.clearCookie('refreshToken');

      const statusCode = 401;
      let errorCode = 'TOKEN_REFRESH_FAILED';
      let message = 'Token refresh failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'REFRESH_TOKEN_EXPIRED':
            message = 'Refresh token expired';
            errorCode = 'TOKEN_EXPIRED';
            break;
          case 'INVALID_REFRESH_TOKEN':
            message = 'Invalid refresh token';
            errorCode = 'INVALID_TOKEN';
            break;
          case 'INVALID_SESSION':
            message = 'Session not found or expired';
            errorCode = 'SESSION_INVALID';
            break;
          case 'USER_NOT_FOUND':
            message = 'User not found or inactive';
            errorCode = 'USER_NOT_FOUND';
            break;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: message,
        code: errorCode
      });
    }
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke session
 * @access  Private
 */
router.post('/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const authHeader = req.get('Authorization');
      const accessToken = AuthService.extractTokenFromHeader(authHeader);

      if (accessToken) {
        await AuthService.revokeSession(accessToken, req.user?.id as string);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      await logSecurityEvent({
        user_id: req.user?.id as string,
        event_type: 'logout',
        severity: 'low',
        description: 'User logout successful',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('User logout successful', {
        userId: req.user?.id,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Private
 */
router.post('/logout-all',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      await AuthService.revokeAllUserSessions(req.user?.id as string);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      await logSecurityEvent({
        user_id: req.user?.id as string,
        event_type: 'logout',
        severity: 'medium',
        description: 'User logout from all devices',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('User logout from all devices', {
        userId: req.user?.id,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      logger.error('Logout all failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_ALL_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user?.id,
          email: req.user?.email,
          username: req.user?.username,
          firstName: req.user?.first_name,
          lastName: req.user?.last_name,
          role: req.user?.role,
          isActive: req.user?.is_active,
          isVerified: req.user?.is_verified,
          mfaEnabled: req.user?.mfa_enabled,
          lastLoginAt: req.user?.last_login_at,
          createdAt: req.user?.created_at,
          updatedAt: req.user?.updated_at
        }
      }
    });
  })
);

/**
 * @route   GET /api/auth/check
 * @desc    Check if user is authenticated
 * @access  Public (with optional auth)
 */
router.get('/check',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        isAuthenticated: !!req.user,
        user: req.user ? {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        } : null
      }
    });
  })
);

export default router;